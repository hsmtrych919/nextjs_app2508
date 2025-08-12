// サテライト投資管理アプリ - Agent1⇔Agent2型変換ユーティリティ
// Agent 1 Phase 3-1: 型定義整合性確保

import type { 
  StockHoldingType, 
  BudgetType as Agent1BudgetType, 
  FormationType as Agent1FormationType,
  FormationUsageType as Agent1FormationUsageType,
  ApiFormationType,
  ApiHoldingType,
  ApiBudgetType,
  ApiSettingsType,
  ApiFormationUsageType
} from '../constants/types';

import { formationIdConverter } from '../constants/types';

import type { 
  HoldingType as Agent2HoldingType,
  BudgetType as Agent2BudgetType,
  FormationType as Agent2FormationType,
  SettingsType as Agent2SettingsType,
  FormationUsageType as Agent2FormationUsageType 
} from './types';

// Agent1 → Agent2変換関数
export const convertAgent1ToAgent2Holding = (stock: StockHoldingType): Agent2HoldingType => ({
  id: stock.id,
  ticker: stock.ticker,
  tier: 1, // デフォルト値（実際の使用時に適切に設定）
  entryPrice: stock.entryPrice,
  holdShares: stock.holdShares,
  goalShares: stock.goalShares,
  currentPrice: stock.currentPrice,
  updatedAt: new Date().toISOString()
});

export const convertAgent1ToAgent2Budget = (budget: Agent1BudgetType): Partial<Agent2BudgetType> => ({
  funds: budget.funds,
  start: budget.start,
  profit: budget.profit,
  // returnPercentageは計算値なのでAPI送信時は除外
});

export const convertAgent1ToAgent2Formation = (formation: Agent1FormationType): Agent2FormationType => ({
  id: formationIdConverter.toAgent2(formation.id),
  name: formation.name,
  tiers: formation.tiers,
  targetPercentages: formation.percentages,
  description: `${formation.tiers}銘柄による配分: ${formation.percentages.join('-')}%`
});

// Agent2 → Agent1変換関数
export const convertAgent2ToAgent1Holding = (holding: Agent2HoldingType): StockHoldingType => ({
  id: holding.id,
  ticker: holding.ticker,
  entryPrice: holding.entryPrice,
  holdShares: holding.holdShares,
  goalShares: holding.goalShares,
  currentPrice: holding.currentPrice,
  lastUpdated: new Date(holding.updatedAt)
});

export const convertAgent2ToAgent1Budget = (budget: Agent2BudgetType): Agent1BudgetType => ({
  funds: budget.funds,
  start: budget.start,
  profit: budget.profit,
  returnPercentage: budget.returnPercentage || 0
});

export const convertAgent2ToAgent1Formation = (formation: Agent2FormationType): Agent1FormationType => ({
  id: formationIdConverter.toAgent1(formation.id),
  name: formation.name,
  tiers: formation.tiers,
  percentages: formation.targetPercentages
});

export const convertAgent2ToAgent1FormationUsage = (usage: Agent2FormationUsageType): Agent1FormationUsageType => ({
  formationId: formationIdConverter.toAgent1(usage.formationId),
  usageCount: usage.usageCount,
  usagePercentage: usage.usagePercentage,
  lastUsed: new Date(usage.lastUsedDate)
});

// バッチ変換ユーティリティ
export const convertHoldingsAgent1ToAgent2 = (holdings: StockHoldingType[]): Agent2HoldingType[] => {
  return holdings.map(convertAgent1ToAgent2Holding);
};

export const convertHoldingsAgent2ToAgent1 = (holdings: Agent2HoldingType[]): StockHoldingType[] => {
  return holdings.map(convertAgent2ToAgent1Holding);
};

export const convertFormationsAgent2ToAgent1 = (formations: Agent2FormationType[]): Agent1FormationType[] => {
  return formations.map(convertAgent2ToAgent1Formation);
};

export const convertFormationUsageAgent2ToAgent1 = (usageStats: Agent2FormationUsageType[]): Agent1FormationUsageType[] => {
  return usageStats.map(convertAgent2ToAgent1FormationUsage);
};

// 型ガード関数
export const isAgent1StockHolding = (obj: unknown): obj is StockHoldingType => {
  return (
    typeof obj === 'object' &&
    obj !== null &&
    'id' in obj &&
    'ticker' in obj &&
    'entryPrice' in obj &&
    'holdShares' in obj &&
    'goalShares' in obj
  );
};

export const isAgent2Holding = (obj: unknown): obj is Agent2HoldingType => {
  return (
    typeof obj === 'object' &&
    obj !== null &&
    'id' in obj &&
    'ticker' in obj &&
    'tier' in obj &&
    'entryPrice' in obj &&
    'holdShares' in obj &&
    'goalShares' in obj &&
    'updatedAt' in obj
  );
};

export const isAgent1Formation = (obj: unknown): obj is Agent1FormationType => {
  return (
    typeof obj === 'object' &&
    obj !== null &&
    'id' in obj &&
    'name' in obj &&
    'tiers' in obj &&
    'percentages' in obj &&
    Array.isArray((obj as Agent1FormationType).percentages)
  );
};

export const isAgent2Formation = (obj: unknown): obj is Agent2FormationType => {
  return (
    typeof obj === 'object' &&
    obj !== null &&
    'id' in obj &&
    'name' in obj &&
    'tiers' in obj &&
    'targetPercentages' in obj &&
    'description' in obj &&
    Array.isArray((obj as Agent2FormationType).targetPercentages)
  );
};

// バリデーション付き変換関数
export const safeConvertAgent1ToAgent2Holding = (stock: unknown): Agent2HoldingType | null => {
  if (!isAgent1StockHolding(stock)) {
    return null;
  }
  return convertAgent1ToAgent2Holding(stock);
};

export const safeConvertAgent2ToAgent1Holding = (holding: unknown): StockHoldingType | null => {
  if (!isAgent2Holding(holding)) {
    return null;
  }
  return convertAgent2ToAgent1Holding(holding);
};

export const safeConvertAgent1ToAgent2Formation = (formation: unknown): Agent2FormationType | null => {
  if (!isAgent1Formation(formation)) {
    return null;
  }
  return convertAgent1ToAgent2Formation(formation);
};

export const safeConvertAgent2ToAgent1Formation = (formation: unknown): Agent1FormationType | null => {
  if (!isAgent2Formation(formation)) {
    return null;
  }
  return convertAgent2ToAgent1Formation(formation);
};

// デバッグ用ユーティリティ
export const logConversionResult = <T>(
  originalValue: unknown, 
  convertedValue: T, 
  conversionType: string
) => {
  if (process.env.NODE_ENV === 'development') {
    console.log(`[Type Conversion] ${conversionType}:`);
    console.log('Original:', originalValue);
    console.log('Converted:', convertedValue);
    console.log('---');
  }
};

export const validateConversionIntegrity = (
  agent1Data: StockHoldingType[], 
  agent2Data: Agent2HoldingType[]
): boolean => {
  if (agent1Data.length !== agent2Data.length) {
    console.warn('データ変換後の配列長が一致しません');
    return false;
  }

  for (let i = 0; i < agent1Data.length; i++) {
    const agent1Item = agent1Data[i];
    const agent2Item = agent2Data[i];
    
    if (
      agent1Item.id !== agent2Item.id ||
      agent1Item.ticker !== agent2Item.ticker ||
      agent1Item.entryPrice !== agent2Item.entryPrice ||
      agent1Item.holdShares !== agent2Item.holdShares ||
      agent1Item.goalShares !== agent2Item.goalShares
    ) {
      console.warn(`データ変換の整合性エラー: インデックス ${i}`);
      return false;
    }
  }

  return true;
};