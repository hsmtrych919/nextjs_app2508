/**
 * サテライト投資対象銘柄ティッカー定数
 */

// サテライト投資対象銘柄（21銘柄）
export const SATELLITE_TICKERS: string[] = [
  'AMZN',   // Amazon.com Inc
  'AVGO',   // Broadcom Inc
  'COIN',   // Coinbase Global Inc
  'CRM',    // Salesforce Inc
  'CRWD',   // CrowdStrike Holdings Inc
  'GOOGL',  // Alphabet Inc Class A
  'META',   // Meta Platforms Inc
  'MSFT',   // Microsoft Corporation
  'NFLX',   // Netflix Inc
  'NVDA',   // NVIDIA Corporation
  'ORCL',   // Oracle Corporation
  'PLTR',   // Palantir Technologies Inc
  'PYPL',   // PayPal Holdings Inc
  'SHOP',   // Shopify Inc
  'SNOW',   // Snowflake Inc
  'SQ',     // Block Inc (旧Square)
  'TSLA',   // Tesla Inc
  'UBER',   // Uber Technologies Inc
  'V',      // Visa Inc
  'WDAY',   // Workday Inc
  'ZM'      // Zoom Video Communications Inc
];

// ティッカー情報の型定義
export type TickerInfo = {
  ticker: string;
  name: string;
  sector?: string;
};

// 詳細なティッカー情報（オプショナル）
export const TICKER_INFO: TickerInfo[] = [
  { ticker: 'AMZN', name: 'Amazon.com Inc', sector: 'Consumer Discretionary' },
  { ticker: 'AVGO', name: 'Broadcom Inc', sector: 'Technology' },
  { ticker: 'COIN', name: 'Coinbase Global Inc', sector: 'Financial Services' },
  { ticker: 'CRM', name: 'Salesforce Inc', sector: 'Technology' },
  { ticker: 'CRWD', name: 'CrowdStrike Holdings Inc', sector: 'Technology' },
  { ticker: 'GOOGL', name: 'Alphabet Inc Class A', sector: 'Communication' },
  { ticker: 'META', name: 'Meta Platforms Inc', sector: 'Communication' },
  { ticker: 'MSFT', name: 'Microsoft Corporation', sector: 'Technology' },
  { ticker: 'NFLX', name: 'Netflix Inc', sector: 'Communication' },
  { ticker: 'NVDA', name: 'NVIDIA Corporation', sector: 'Technology' },
  { ticker: 'ORCL', name: 'Oracle Corporation', sector: 'Technology' },
  { ticker: 'PLTR', name: 'Palantir Technologies Inc', sector: 'Technology' },
  { ticker: 'PYPL', name: 'PayPal Holdings Inc', sector: 'Financial Services' },
  { ticker: 'SHOP', name: 'Shopify Inc', sector: 'Technology' },
  { ticker: 'SNOW', name: 'Snowflake Inc', sector: 'Technology' },
  { ticker: 'SQ', name: 'Block Inc', sector: 'Financial Services' },
  { ticker: 'TSLA', name: 'Tesla Inc', sector: 'Consumer Discretionary' },
  { ticker: 'UBER', name: 'Uber Technologies Inc', sector: 'Technology' },
  { ticker: 'V', name: 'Visa Inc', sector: 'Financial Services' },
  { ticker: 'WDAY', name: 'Workday Inc', sector: 'Technology' },
  { ticker: 'ZM', name: 'Zoom Video Communications Inc', sector: 'Communication' }
];

// ティッカー検索・検証用ユーティリティ関数
export const isValidTicker = (ticker: string): boolean => {
  return SATELLITE_TICKERS.includes(ticker.toUpperCase());
};

export const getTickerInfo = (ticker: string): TickerInfo | undefined => {
  return TICKER_INFO.find(info => info.ticker === ticker.toUpperCase());
};

export const getTickersBysector = (sector: string): TickerInfo[] => {
  return TICKER_INFO.filter(info => info.sector === sector);
};