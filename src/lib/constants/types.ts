/**
 * サテライト投資管理アプリ用型定義
 */

// フォーメーション型の定義
export type FormationType = {
  id: string;
  name: string;
  tiers: number;
  percentages: number[];
};

// Tier構造の定義
export type TierType = {
  id: string;
  percentage: number;
  targetAmount: number;
  stocks: StockHoldingType[];
};

// 銘柄保有情報の型定義
export type StockHoldingType = {
  id: string;
  ticker: string;
  entryPrice: number;
  holdShares: number;
  goalShares: number;
  currentPrice?: number;
  lastUpdated?: Date;
};

// 予算管理情報の型定義
export type BudgetType = {
  funds: number;        // 総資金
  start: number;        // 開始元本
  profit: number;       // 利益
  returnPercentage: number; // リターン率
};

// フォーメーション使用統計の型定義
export type FormationUsageType = {
  formationId: string;
  usageCount: number;
  usagePercentage: number;
  lastUsed: Date;
};

// アプリケーション全体の状態型定義
export type AppStateType = {
  selectedFormation: FormationType | null;
  tiers: TierType[];
  budget: BudgetType;
  formationUsage: FormationUsageType[];
  isLoading: boolean;
  error: string | null;
};

// API関連の型定義（Agent2との統合用）
export type ApiResponseType<T> = {
  success: boolean;
  data?: T;
  error?: string;
  timestamp: string;
};

export type SaveDataRequestType = {
  formation: FormationType;
  tiers: TierType[];
  budget: BudgetType;
};

export type LoadDataResponseType = {
  formation: FormationType | null;
  tiers: TierType[];
  budget: BudgetType;
  formationUsage: FormationUsageType[];
};

// フォーメーション定義の定数（正しい値）
export const FORMATION_DEFINITIONS: FormationType[] = [
  {
    id: 'formation-3-50-30-20',
    name: '3銘柄 50-30-20%型',
    tiers: 3,
    percentages: [50, 30, 20]
  },
  {
    id: 'formation-4-35-30-20-15',
    name: '4銘柄 35-30-20-15%型',
    tiers: 4,
    percentages: [35, 30, 20, 15]
  },
  {
    id: 'formation-5-30-25-20-15-10',
    name: '5銘柄 30-25-20-15-10%型',
    tiers: 5,
    percentages: [30, 25, 20, 15, 10]
  },
  {
    id: 'formation_full_position',
    name: 'フルポジ',
    tiers: 0,
    percentages: []
  },
  {
    id: 'formation_no_position',
    name: 'ノーポジ',
    tiers: 0,
    percentages: []
  }
];

// Agent2 API型定義との互換性確保のための型エイリアス
export type ApiFormationType = {
  id: string;
  name: string;
  tiers: number;
  targetPercentages: number[];
  description: string;
};

export type ApiHoldingType = {
  id: string;
  ticker: string;
  tier: number;
  entryPrice: number;
  holdShares: number;
  goalShares: number;
  currentPrice?: number;
  updatedAt: string;
};

export type ApiBudgetType = {
  id: string;
  funds: number;
  start: number;
  profit: number;
  returnPercentage?: number;
  updatedAt: string;
};

export type ApiSettingsType = {
  id: string;
  currentFormationId: string;
  lastCheckDate: string;
  autoCheckEnabled: boolean;
  createdAt: string;
  updatedAt: string;
};

export type ApiFormationUsageType = {
  id: string;
  formationId: string;
  usageCount: number;
  totalDays: number;
  usagePercentage: number;
  lastUsedDate: string;
  createdAt: string;
};

// Agent1⇔Agent2変換ユーティリティ関数型
export type FormationIdConverter = {
  toAgent2: (agent1Id: string) => string; // formation_3_50_30_20 → formation-3-50-30-20
  toAgent1: (agent2Id: string) => string; // formation-3-50-30-20 → formation_3_50_30_20
};

export const formationIdConverter: FormationIdConverter = {
  toAgent2: (agent1Id: string) => agent1Id.replace(/_/g, '-'),
  toAgent1: (agent2Id: string) => agent2Id.replace(/-/g, '_')
};