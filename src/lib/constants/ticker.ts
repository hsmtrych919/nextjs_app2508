/**
 * サテライト投資対象銘柄ティッカー定数
 */

// サテライト投資対象銘柄（21銘柄）
export const SATELLITE_TICKERS: string[] = [
  'AMZN',   // Amazon.com Inc
  'AVGO',   // Broadcom Inc
  'GOOGL',  // Alphabet Inc Class A
  'META',   // Meta Platforms Inc
  'MSFT',   // Microsoft Corporation
  'NFLX',   // Netflix Inc
  'NVDA',   // NVIDIA Corporation
  'ORCL',   // Oracle Corporation
  'PLTR',   // Palantir Technologies Inc
  'TSLA',   // Tesla Inc
  'HOOD',
  'NBIS',
  'BXWT',
  'ZS',
  'RKLB',
  'OKLO',
  'NET',
  'CRDO',
  'GEV',
  'LEU',
];

// ティッカー検索・検証用ユーティリティ関数
export const isValidTicker = (ticker: string): boolean => {
  return SATELLITE_TICKERS.includes(ticker.toUpperCase());
};