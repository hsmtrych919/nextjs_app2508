/**
 * API クライアント（Phase 3.3 最適化版）
 */

// 疑似API関数（Phase 3.3では内部化されているため簡略化）
export async function saveAllData(data: any) {
  // 実際のAPI実装は省略
  return Promise.resolve({ success: true });
}

export async function saveFormation(formationId: string) {
  return Promise.resolve({ success: true, usageStats: [] });
}

export async function saveBudget(budget: any) {
  return Promise.resolve({ success: true });
}

export async function saveHoldings(holdings: any) {
  return Promise.resolve({ success: true });
}

// 変換関数（Phase 3.3では内部化のため簡略化）
export function convertHoldingsAgent1ToAgent2(holdings: any) {
  return holdings;
}

export function convertFormationUsageAgent2ToAgent1(usage: any) {
  return usage || [];
}

// エラーハンドリング
export function logApiError(error: any, context: string) {
  console.error(`API Error in ${context}:`, error);
}

export function getErrorMessage(error: any): string {
  return error?.message || 'Unknown error occurred';
}
