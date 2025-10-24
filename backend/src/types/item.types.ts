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
}

export interface CreateItemDto {
  title: string;
  description: string;
  status: ItemStatus;
  userId: string;
}

export interface UpdateItemStatusDto {
  status: ItemStatus;
}

