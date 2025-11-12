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

