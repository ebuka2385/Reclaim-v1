import { PrismaClient, User as DataUser } from '@prisma/client';
import type { SSOUserInfo, LoginResult } from '../types/auth.types';

const prisma = new PrismaClient();

// A lot of this class is subject to change depending on hoe SSO get implemented into applications
export class AuthService {
  // logs in users using CWRU SSO authentication
  async loginWithSSO(authCode: string): Promise<LoginResult> {
    const userInfo = await this.exchangeCodeForUserInfo(authCode);
    const user = await this.findOrCreateUser(userInfo);
    return {userId: user.userId,
      email: user.email,
      name: user.name
    };
  }
  
  // WORK IN PROGRESS: Implement SSO API integration based on CWRU SSO documentation
  // exchanges the code for the user's information
  private async exchangeCodeForUserInfo(authCode: string): Promise<SSOUserInfo> {
    throw new Error('SSO integration isnt implemented atm.');
  }

  private async findOrCreateUser(userInfo: SSOUserInfo): Promise<DataUser> {
    const user = await prisma.user.findUnique({where: { email: userInfo.email },});

    if (!(!user)) {
      return user;
    }

    return await prisma.user.create({
      data: {
        email: userInfo.email,
        name: userInfo.name,
      },
    });
  }
}

export const authService = new AuthService();

