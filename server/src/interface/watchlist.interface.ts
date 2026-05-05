export interface IWatchlist {
  id: string;
  userId: string;
  productId: string;
  targetPrice?: number;
  createdAt?: Date;
}