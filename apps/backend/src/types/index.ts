// ========================================
// Common Types
// ========================================

export type Asset = 'BTC' | 'ETH';

export interface Instrument {
  symbol: string;
  strike: number;
  cp: 'C' | 'P'; // Call or Put
  expiry: string;
  baseAsset: Asset;
}

export interface Trade {
  id: string;
  symbol: string;
  price: number;
  quantity: number;
  timestamp: number;
  side: 'BUY' | 'SELL';
}

// ========================================
// Exchange API Types
// ========================================

export interface Ticker {
  symbol: string;
  markPrice: number;
  indexPrice: number;
  impliedVolatility: number;
  delta: number;
  gamma: number;
  theta: number;
  vega: number;
}

export interface IndexPrice {
  symbol: string;
  price: number;
  timestamp: number;
}

// ========================================
// Firebase Data Types
// ========================================

export interface OptionsSnapshot {
  updatedAt: number;
  sessionStart: number;
  underlyingPrice: number;
  atmStrike: number;
  strikes: number[];
  callVolByStrike: number[];
  putVolByStrike: number[];
  ivByStrike: number[];
  meta: SnapshotMeta;
}

export interface SnapshotMeta {
  source: 'binance' | 'bybit';
  fallback?: 'binance' | 'bybit';
  expiries: string[];
}

export interface State {
  lastTradeId: string;
  lastTradeTs: number;
  lastRunAt: number;
  chainVersion: number;
}

export interface ChainCache {
  instruments: Instrument[];
  updatedAt: number;
}

// ========================================
// Aggregation Types
// ========================================

export interface StrikeVolume {
  strike: number;
  callVolume: number;
  putVolume: number;
}

export interface IVData {
  strike: number;
  iv: number;
}

// ========================================
// Configuration Types
// ========================================

export interface Config {
  binance: {
    apiBase: string;
  };
  bybit: {
    apiBase: string;
  };
  firebase: {
    databaseURL: string;
    serviceAccountPath: string;
  };
  jobs: {
    refreshUnderlyingSec: number;
    refreshIVMin: number;
    refreshVolMin: number;
  };
  assets: Asset[];
  primaryExpiry: string;
}
