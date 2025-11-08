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

export interface ListItemFilter {
  status?: ItemStatus;
  userId?: string;
  sortBy?: 'createdAt' | 'title' | 'status';
  sortOrder?: 'asc' | 'desc';
}

export interface MapPin {
  itemId: string;
  title: string;
  status: ItemStatus;
  latitude: number;
  longitude: number;
}

