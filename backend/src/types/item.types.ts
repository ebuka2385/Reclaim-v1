export enum ItemStatus {
  LOST = 'LOST',
  FOUND = 'FOUND',
  CLAIMED = 'CLAIMED',
}

export interface Item {
  id: string;
  title: string;
  description: string;
  status: ItemStatus;
  createdAt: string;
  userId?: string;
  location: string;
}

export interface CreateItemDto {
  title: string;
  description: string;
  status: ItemStatus;
  userId: string;
  location: string;
}

export interface UpdateItemStatusDto {
  status: ItemStatus;
}

