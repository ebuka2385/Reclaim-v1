import { OAuth2Client } from "google-auth-library";
import { PrismaClient } from "@prisma/client";
import { LoginResult } from "../types/auth.types";

const prisma = new PrismaClient();

// Initialize Google OAuth2 client
// Note: Will be undefined if GOOGLE_CLIENT_ID env var is not set, but will fail gracefully in verifyGoogleToken
const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

export class AuthService {
  /**
   * Verifies a Google ID token and returns user information
   * @param idToken - The ID token from Google Sign-In
   * @returns User information from the token
   * @throws Error if token is invalid
   */
  async verifyGoogleToken(idToken: string): Promise<{
    email: string;
    name: string;
    picture?: string;
    sub: string; // Google user ID
  }> {
    if (!process.env.GOOGLE_CLIENT_ID) {
      throw new Error("GOOGLE_CLIENT_ID is not configured");
    }

    try {
      // Verify the token
      const ticket = await client.verifyIdToken({
        idToken,
        audience: process.env.GOOGLE_CLIENT_ID, // Specify the CLIENT_ID of the app that accesses the backend
      });

      const payload = ticket.getPayload();
      if (!payload) {
        throw new Error("Invalid token payload");
      }

      // Extract user information
      const email = payload.email;
      const name = payload.name || "";
      const picture = payload.picture;
      const sub = payload.sub;

      if (!email) {
        throw new Error("Email not found in token");
      }

      return {
        email,
        name,
        picture,
        sub,
      };
    } catch (error) {
      if (error instanceof Error) {
        throw new Error(`Token verification failed: ${error.message}`);
      }
      throw new Error("Token verification failed");
    }
  }

  /**
   * Logs in a user with Google Sign-In
   * Creates a new user if they don't exist, otherwise returns existing user
   * @param idToken - The ID token from Google Sign-In
   * @returns User information and userId
   */
  async loginWithGoogle(idToken: string): Promise<LoginResult> {
    try {
      // Verify the Google token
      const googleUser = await this.verifyGoogleToken(idToken);

      // Check if user exists in database
      let user = await prisma.user.findUnique({
        where: { email: googleUser.email },
      });

      // Create user if they don't exist
      if (!user) {
        user = await prisma.user.create({
          data: {
            email: googleUser.email,
            name: googleUser.name,
          },
        });
      } else {
        // Update user name in case it changed in Google account
        user = await prisma.user.update({
          where: { userId: user.userId },
          data: { name: googleUser.name },
        });
      }

      return {
        userId: user.userId,
        email: user.email,
        name: user.name,
      };
    } catch (error) {
      if (error instanceof Error) {
        throw new Error(`Login failed: ${error.message}`);
      }
      throw new Error("Login failed");
    }
  }

  /**
   * Gets user information by userId
   * @param userId - The user ID
   * @returns User information or null if not found
   */
  async getUserById(userId: string): Promise<LoginResult | null> {
    const user = await prisma.user.findUnique({
      where: { userId },
    });

    if (!user) {
      return null;
    }

    return {
      userId: user.userId,
      email: user.email,
      name: user.name,
    };
  }
}

export const authService = new AuthService();

