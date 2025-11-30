import { Request, Response } from "express";
import { authService } from "../services/auth.service";

export class AuthController {
  /**
   * POST /auth/login
   * Logs in a user with Google Sign-In
   * Body: { idToken: string }
   */
  async login(req: Request, res: Response): Promise<void> {
    try {
      const { idToken } = req.body;

      if (!idToken) {
        res.status(400).json({ error: "Missing required field: idToken" });
        return;
      }

      const result = await authService.loginWithGoogle(idToken);
      res.json(result);
    } catch (error) {
      if (error instanceof Error) {
        // Check for specific error types
        if (error.message.includes("Token verification failed")) {
          res.status(401).json({ error: error.message });
        } else if (error.message.includes("Login failed")) {
          res.status(500).json({ error: error.message });
        } else {
          res.status(500).json({ error: "Authentication failed" });
        }
      } else {
        res.status(500).json({ error: "Authentication failed" });
      }
    }
  }

  /**
   * GET /auth/me/:userId
   * Gets user information by userId
   */
  async getMe(req: Request, res: Response): Promise<void> {
    try {
      const { userId } = req.params;

      if (!userId) {
        res.status(400).json({ error: "Missing required parameter: userId" });
        return;
      }

      const user = await authService.getUserById(userId);

      if (!user) {
        res.status(404).json({ error: "User not found" });
        return;
      }

      res.json(user);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch user information" });
    }
  }

  /**
   * POST /auth/sync
   * Syncs a Clerk user to the database
   * Body: { email: string, name: string }
   */
  async syncUser(req: Request, res: Response): Promise<void> {
    try {
      const { email, name } = req.body;

      if (!email) {
        res.status(400).json({ error: "Missing required field: email" });
        return;
      }

      const result = await authService.syncClerkUser(email, name || '');
      res.json(result);
    } catch (error) {
      if (error instanceof Error) {
        res.status(500).json({ error: error.message });
      } else {
        res.status(500).json({ error: "Failed to sync user" });
      }
    }
  }
}

export const authController = new AuthController();

