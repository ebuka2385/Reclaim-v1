// All code written in this file was created by AI. the prompt was: "Create type definitions for authentication"

// All comments were created by AI after the code was written. The prompt was "Add comments to the auth types file"

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