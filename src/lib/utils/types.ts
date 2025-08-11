// サテライト投資管理アプリ - 共通型定義ファイル
// Agent 1とAgent 2で共有する型定義
// Drizzle ORM スキーマと完全に整合性を保つ

import type { 
  Settings as DbSettings, 
  Holdings as DbHoldings, 
  Budget as DbBudget, 
  FormationUsage as DbFormationUsage,
  FormationHistory as DbFormationHistory
} from './schema';

// === データベース由来の型定義 ===

// 設定情報（データベーススキーマと整合）
export type SettingsType = DbSettings;

// 銘柄保有情報（データベーススキーマと整合）
export type HoldingsType = DbHoldings & {
  currentPrice?: number; // 外部API取得用の拡張フィールド
};

// 予算管理情報（データベーススキーマと整合）
export type BudgetType = DbBudget & {
  returnPercentage?: number; // 計算用の拡張フィールド（年利％）
};

// フォーメーション使用統計（データベーススキーマと整合）
export type FormationUsageType = DbFormationUsage;

// フォーメーション変更履歴（データベーススキーマと整合）
export type FormationHistoryType = DbFormationHistory;

// === フロントエンド専用型定義 ===

// フォーメーション定義（マスターデータ）
export interface FormationType {
  id: string;
  name: string;
  tiers: number;
  targetPercentages: number[]; // 各Tierの目標配分率
  description: string;
}

// API互換性のための型エイリアス
export type HoldingType = HoldingsType; // 既存コードとの互換性

// === API 型定義システム ===

// ベースレスポンス型
export interface ApiBaseResponse {
  success: boolean;
  timestamp: string;
  version?: string;
}

// 成功レスポンス
export interface ApiSuccessResponse<T = unknown> extends ApiBaseResponse {
  success: true;
  data: T;
}

// エラーレスポンス
export interface ApiErrorResponse extends ApiBaseResponse {
  success: false;
  error: {
    code: string;
    message: string;
    details?: unknown;
  };
}

// 統合レスポンス型
export type ApiResponse<T = unknown> = ApiSuccessResponse<T> | ApiErrorResponse;

// データAPI専用型
export interface ApiDataRequest {
  budget?: Partial<BudgetType>;
  holdings?: HoldingType[];
  settings?: Partial<SettingsType>;
  formationId?: string;
  requestId?: string; // リクエスト追跡用
}

export interface ApiDataSuccessData {
  budget: BudgetType;
  holdings: HoldingType[];
  settings: SettingsType;
  formations: FormationType[];
  usageStats: FormationUsageType[];
}

export type ApiDataResponse = ApiResponse<ApiDataSuccessData>;

// CronAPI専用型
export interface ApiCronSuccessData {
  message: string;
  changesDetected: boolean;
  processedFormations: string[];
  updatedUsage?: FormationUsageType[];
  statistics?: {
    totalChecked: number;
    changesFound: number;
    processingTime: number;
  };
}

export type ApiCronResponse = ApiResponse<ApiCronSuccessData>;

// エラーコード定数
export const API_ERROR_CODES = {
  VALIDATION_ERROR: 'VALIDATION_ERROR',
  DATABASE_ERROR: 'DATABASE_ERROR',
  NOT_FOUND: 'NOT_FOUND',
  METHOD_NOT_ALLOWED: 'METHOD_NOT_ALLOWED',
  INTERNAL_ERROR: 'INTERNAL_ERROR',
  INVALID_FORMATION: 'INVALID_FORMATION',
  INSUFFICIENT_DATA: 'INSUFFICIENT_DATA'
} as const;

export type ApiErrorCode = typeof API_ERROR_CODES[keyof typeof API_ERROR_CODES];

// Zustand Store状態型
export interface AppStore {
  // 現在の状態
  currentFormation: FormationType | null;
  holdings: HoldingType[];
  budget: BudgetType | null;
  usageStats: FormationUsageType[];
  
  // UI状態
  isLoading: boolean;
  error: string | null;
  
  // アクション
  setFormation: (formation: FormationType) => void;
  updateHolding: (holding: HoldingType) => void;
  updateBudget: (budget: BudgetType) => void;
  loadData: () => Promise<void>;
  saveData: () => Promise<void>;
  clearError: () => void;
}

// === Cloudflare 統合型定義 ===

// Cloudflare D1 データベース型
export interface D1Database {
  prepare(query: string): D1PreparedStatement;
  exec(query: string): Promise<D1ExecResult>;
  dump(): Promise<ArrayBuffer>;
  batch<T = unknown>(statements: D1PreparedStatement[]): Promise<D1Result<T>[]>;
}

export interface D1PreparedStatement {
  bind(...values: unknown[]): D1PreparedStatement;
  first<T = unknown>(): Promise<T | null>;
  all<T = unknown>(): Promise<D1Result<T>>;
  run(): Promise<D1RunResult>;
}

export interface D1Meta {
  served_by: string;
  duration: number;
  changes: number;
  last_row_id: number;
  rows_read: number;
  rows_written: number;
  size_after?: number;
}

export interface D1Result<T = unknown> {
  results: T[];
  success: boolean;
  meta: D1Meta;
}

export interface D1ExecResult {
  results: D1Result[];
  success: boolean;
  meta: Omit<D1Meta, 'changes' | 'last_row_id' | 'rows_read' | 'rows_written'>;
}

export interface D1RunResult {
  success: boolean;
  meta: D1Meta;
  error?: string;
}

// Cloudflare Workers Environment
export interface CloudflareEnv {
  DB: D1Database;
  ENVIRONMENT: 'development' | 'preview' | 'production';
  
  // Cloudflare Workers 標準環境変数
  CF_PAGES?: string;
  CF_PAGES_COMMIT_SHA?: string;
  CF_PAGES_BRANCH?: string;
  CF_PAGES_URL?: string;
  
  // アプリ固有の環境変数
  API_VERSION?: string;
  DEBUG_MODE?: string;
}

// ティッカー定数型 - Agent 1のSATELLITE_TICKERSと統合
export type TickerSymbol = 
  | 'AMZN' | 'AVGO' | 'COIN' | 'CRM' | 'CRWD' | 'GOOGL' 
  | 'META' | 'MSFT' | 'NFLX' | 'NVDA' | 'ORCL' | 'PLTR'
  | 'PYPL' | 'SHOP' | 'SNOW' | 'SQ' | 'TSLA' | 'UBER'
  | 'V' | 'WDAY' | 'ZM';

// フォーメーション定義定数
export const FORMATIONS: FormationType[] = [
  {
    id: 'formation-3-50-30-20',
    name: '3銘柄 50-30-20%型',
    tiers: 3,
    targetPercentages: [50, 30, 20],
    description: '主力1銘柄50%、サポート2銘柄で30%・20%の配分'
  },
  {
    id: 'formation-4-40-30-20-10',
    name: '4銘柄 40-30-20-10%型',
    tiers: 4,
    targetPercentages: [40, 30, 20, 10],
    description: 'バランス型：40%・30%・20%・10%の段階的配分'
  },
  {
    id: 'formation-5-30-25-20-15-10',
    name: '5銘柄 30-25-20-15-10%型',
    tiers: 5,
    targetPercentages: [30, 25, 20, 15, 10],
    description: '分散型：30%から10%まで5段階の配分'
  }
];

// デフォルト値定数
export const DEFAULT_BUDGET: Omit<BudgetType, 'id'> = {
  funds: 6000,
  start: 6000,
  profit: 0,
  updatedAt: new Date().toISOString()
};

export const TICKER_SYMBOLS: TickerSymbol[] = [
  'AMZN', 'AVGO', 'COIN', 'CRM', 'CRWD', 'GOOGL',
  'META', 'MSFT', 'NFLX', 'NVDA', 'ORCL', 'PLTR',
  'PYPL', 'SHOP', 'SNOW', 'SQ', 'TSLA', 'UBER',
  'V', 'WDAY', 'ZM'
];

// === ユーティリティ関数型定義 ===

// 計算関数型
export type CalculateGoalShares = (targetAmount: number, currentPrice: number) => number;
export type CalculateReturnPercentage = (funds: number, start: number, profit: number) => number;
export type CalculateTierAllocation = (totalAmount: number, percentage: number) => number;
export type CalculatePortfolioValue = (holdings: HoldingType[]) => number;

// フォーマット関数型
export type FormatCurrency = (amount: number, currency?: 'USD' | 'JPY') => string;
export type FormatPercentage = (value: number, precision?: number) => string;
export type FormatDate = (date: string | Date, format?: 'short' | 'long') => string;
export type FormatNumber = (value: number, options?: Intl.NumberFormatOptions) => string;

// バリデーション関数型
export type ValidateHolding = (holding: Partial<HoldingType>) => boolean;
export type ValidateBudget = (budget: Partial<BudgetType>) => boolean;
export type ValidateFormation = (formationId: string) => boolean;
export type ValidateTickerSymbol = (ticker: string) => ticker is TickerSymbol;

// 型ガード関数型
export type IsHoldingType = (obj: unknown) => obj is HoldingType;
export type IsBudgetType = (obj: unknown) => obj is BudgetType;
export type IsSettingsType = (obj: unknown) => obj is SettingsType;
export type IsApiDataRequest = (obj: unknown) => obj is ApiDataRequest;

// 型変換関数型  
export type HoldingToDbHolding = (holding: HoldingType) => DbHoldings;
export type DbHoldingToHolding = (dbHolding: DbHoldings) => HoldingType;
export type SettingsToDbSettings = (settings: SettingsType) => DbSettings;
export type DbSettingsToSettings = (dbSettings: DbSettings) => SettingsType;

// === 型定義統合完了マーク ===
export const TYPE_SYSTEM_VERSION = '1.3.0' as const;
export const SCHEMA_COMPATIBILITY_VERSION = '1.0.0' as const;