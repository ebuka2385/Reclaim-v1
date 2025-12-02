// All code written in this file was created by AI. the prompt was: "Create type definitions for claims"

// All comments were created by AI after the code was written. The prompt was "Add comments to the claim types file"

export enum ClaimStatus {
  OPEN = "OPEN",
  ACCEPTED = "ACCEPTED",
  DECLINED = "DECLINED",
}

export interface Claim {
  claimId: string;
  itemId: string;
  claimerId: string;
  finderId: string;
  status: ClaimStatus;
  handedOff: boolean;
  createdAt: string;
}

export interface CreateClaimDto {
  itemId: string;
  claimerId: string;
}

export interface UpdateClaimStatusDto {
  status: ClaimStatus;
}

