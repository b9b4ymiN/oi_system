import type { Config } from '../types/index.js';

export function loadConfig(): Config {
  const assets = (process.env.DEFAULT_ASSETS || 'BTC').split(',') as Array<'BTC' | 'ETH'>;

  return {
    binance: {
      apiBase: process.env.BINANCE_API_BASE || 'https://eapi.binance.com'
    },
    bybit: {
      apiBase: process.env.BYBIT_API_BASE || 'https://api.bybit.com'
    },
    firebase: {
      databaseURL: process.env.FIREBASE_DB_URL || '',
      serviceAccountPath: process.env.FIREBASE_SERVICE_ACCOUNT_PATH || './firebase/service-account.json'
    },
    jobs: {
      refreshUnderlyingSec: parseInt(process.env.REFRESH_UNDERLYING_SEC || '60'),
      refreshIVMin: parseInt(process.env.REFRESH_IV_MIN || '5'),
      refreshVolMin: parseInt(process.env.REFRESH_VOL_MIN || '5')
    },
    assets,
    primaryExpiry: process.env.PRIMARY_EXPIRY || '2026-01-31'
  };
}

export const config = loadConfig();
