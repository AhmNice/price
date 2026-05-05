// request interface

export interface ICreateProductDTO {
  name: string;
  category?: string;
}

export interface ICreateMarketDTO {
  name: string;
  location?: string;
}

export interface IAddPriceDTO {
  productId: string;
  marketId: string;
  price: number;
}

export interface ICreateWatchlistDTO {
  userId: string;
  productId: string;
  targetPrice?: number;
}

// Response Interfaces

export interface IProductPriceComparison {
  productId: string;
  productName: string;
  prices: {
    marketId: string;
    marketName: string;
    price: number;
    lastUpdated: Date;
  }[];
}

export interface IAlertResult {
  userId: string;
  productId: string;
  currentPrice: number;
  targetPrice?: number;
  triggered: boolean;
}