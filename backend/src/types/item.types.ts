// All code written in this file was created by Ethan Hunt and is completely original in terms of its use. I used several resources to help aid my coding process as I have never used Prisma or TypeScript before.

// All comments were created by AI after the code was written. The prompt was "Add comments to the item types file"

export enum ItemStatus {
  LOST = "LOST",
  FOUND = "FOUND",
  CLAIMED = "CLAIMED",
}

export interface Item {
  id: string;
  title: string;
  description: string;
  status: ItemStatus;
  createdAt: string;
  userId?: string;
  category?: string;
}

export interface CreateItemDto {
  title: string;
  description: string;
  status: ItemStatus;
  userId: string;
  latitude?: number;
  longitude?: number;
  category?: string;
}

export interface UpdateItemStatusDto {
  status: ItemStatus;
}

export interface UpdateItemDto {
  title?: string;
  description?: string;
  status?: ItemStatus;
  category?: string;
}

export interface MapBounds {
  north: number;  // max latitude
  south: number;  // min latitude
  east: number;   // max longitude
  west: number;   // min longitude
}

export interface ItemFilter {
  status?: ItemStatus;
  userId?: string;
  category?: string;
  bounds?: MapBounds;
  sortBy?: "createdAt" | "title" | "status";
  sortOrder?: "asc" | "desc";
}

export interface MapPin {
  itemId: string;
  title: string;
  description: string;
  status: ItemStatus;
  latitude: number;
  longitude: number;
}

