// src/types.ts

export type Market = 'US' | 'HK';

export interface Holding {
  id: string;
  symbol: string;
  buyPrice: number;
  quantity: number;
  market: Market;
  createdAt: string;
}

export interface StockQuote {
  symbol: string;
  price: number;
  currency: string;
  change?: number;          // 加上 ? 變成可選
  changePercent?: number;   // 加上 ? 變成可選
  updatedAt?: string;       // 加上 ? 變成可選
}

export interface HoldingWithQuote extends Holding {
  quote?: {
    symbol: string;
    price: number;
    currency: string;
  };
  costBasis: number;
  marketValue: number;
  profitLoss: number;
  profitLossPercent: number;
}

export interface PortfolioSummary {
  totalCost: number;
  totalValue: number;
  totalProfitLoss: number;
  totalProfitLossPercent: number;
}

export interface QuoteMap {
  [symbol: string]: {
    symbol: string;
    price: number;
    currency: string;
  };

  
}