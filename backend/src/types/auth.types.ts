export interface SSOUserInfo {
  email: string;
  name: string;
}

export interface LoginResult {
  userId: string;
  email: string;
  name: string;
}

export interface LoginRequest {
  idToken: string;
}

export interface GoogleTokenPayload {
  email: string;
  name: string;
  picture?: string;
  sub: string;
}