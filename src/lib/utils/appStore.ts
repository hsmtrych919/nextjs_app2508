/**
 * Phase 3.3: 状態管理最適化版
 * - API関連状態の内部化
 * - UI必要状態のみ公開
 * - 自動保存の背景実行
 */

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type {
  FormationType,
  TierType,
  BudgetType,
  FormationUsageType,
  StockHoldingType,
  AppStateType
} from '../constants/types';
import { FORMATION_DEFINITIONS } from '../constants/types';
import {
  saveAllData,
  saveFormation,
  saveBudget,
  saveHoldings,
  convertHoldingsAgent1ToAgent2,
  convertFormationUsageAgent2ToAgent1,
  logApiError,
  getErrorMessage
} from './apiClient';

// Phase 3.3: 内部API関数の定義（外部公開なし）
const internalAPI = {
  isAutoSaveEnabled: true,

  async saveDataToAPI(state: AppStateType) {
    if (!this.isAutoSaveEnabled) return;

    try {
      const { selectedFormation, tiers, budget } = state;

      if (selectedFormation) {
        const formationResponse = await fetch('/api/data', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            type: 'formation',
            data: { formationId: selectedFormation.id }
          })
        });
        if (!formationResponse.ok) throw new Error('フォーメーション保存に失敗');
      }

      const budgetResponse = await fetch('/api/data', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: 'budget',
          data: budget
        })
      });
      if (!budgetResponse.ok) throw new Error('予算保存に失敗');

      const holdings = tiers.flatMap(tier =>
        tier.stocks?.filter(stock => stock.holdShares > 0) || []
      );
      if (holdings.length > 0) {
        const holdingsResponse = await fetch('/api/data', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            type: 'holdings',
            data: holdings
          })
        });
        if (!holdingsResponse.ok) throw new Error('保有株式保存に失敗');
      }
    } catch (error) {
      console.error('自動保存エラー:', error);
    }
  },

  async loadDataFromAPI(): Promise<Partial<AppStateType> | null> {
    try {
      const response = await fetch('/api/data');
      if (!response.ok) return null;

      const data = await response.json();
      return {
        selectedFormation: data.formation || null,
        tiers: data.tiers || [],
        budget: data.budget || {
          funds: 6000,
          start: 0,
          profit: 0,
          returnPercentage: 0
        },
        formationUsage: data.formationUsage || []
      };
    } catch (error) {
      console.error('データ読み込みエラー:', error);
      return null;
    }
  },

  enableAutoSave() {
    this.isAutoSaveEnabled = true;
  },

  disableAutoSave() {
    this.isAutoSaveEnabled = false;
  }
};

// 初期状態の定義
const initialState: AppStateType = {
  selectedFormation: null,
  tiers: [],
  budget: {
    funds: 6000,
    start: 0,
    profit: 0,
    returnPercentage: 0
  },
  formationUsage: [],
  isLoading: false,
  error: null
};

// Phase 3.3: 最適化されたアクション型（UI必要のみ）
interface OptimizedAppActions {
  // フォーメーション管理
  selectFormation: (formation: FormationType) => void;
  clearFormation: () => void;

  // 銘柄管理
  addStockToTier: (tierId: string, stock: StockHoldingType) => void;
  updateStockInTier: (tierId: string, stockId: string, updates: Partial<StockHoldingType>) => void;
  removeStockFromTier: (tierId: string, stockId: string) => void;

  // 予算管理
  updateBudget: (budgetUpdates: Partial<BudgetType>) => void;
  calculateBudgetMetrics: () => void;

  // UI状態管理
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;

  // 内部メソッド（公開するが内部使用）
  updateFormationUsage: (formationId: string) => void;

  // 自動保存制御
  enableAutoSave: () => void;
  disableAutoSave: () => void;
}

type AppStore = AppStateType & OptimizedAppActions;

// Phase 3.3: 最適化されたストア
export const useAppStore = create<AppStore>()(
  persist(
    (set, get) => ({
      ...initialState,

      // フォーメーション管理
      selectFormation: (formation) => {
        const tierCount = formation.tiers;
        const newTiers: TierType[] = Array.from({ length: tierCount }, (_, index) => ({
          id: `tier-${index + 1}`,
          percentage: formation.percentages[index] || 0,
          targetAmount: 0,
          stocks: []
        }));

        set((state) => {
          const updatedBudget = { ...state.budget };

          newTiers.forEach(tier => {
            tier.targetAmount = (updatedBudget.funds * tier.percentage) / 100;
          });

          return {
            selectedFormation: formation,
            tiers: newTiers,
            budget: updatedBudget,
            error: null
          };
        });

        get().updateFormationUsage(formation.id);

        // 内部API関数による自動保存
        const currentState = get();
        internalAPI.saveDataToAPI(currentState);
      },

      clearFormation: () => {
        set({
          selectedFormation: null,
          tiers: [],
          error: null
        });
      },

      // 銘柄管理
      addStockToTier: (tierId, stock) => {
        set((state) => ({
          tiers: state.tiers.map(tier =>
            tier.id === tierId
              ? { ...tier, stocks: [...tier.stocks, stock] }
              : tier
          )
        }));

        const currentState = get();
        internalAPI.saveDataToAPI(currentState);
      },

      updateStockInTier: (tierId, stockId, updates) => {
        set((state) => ({
          tiers: state.tiers.map(tier =>
            tier.id === tierId
              ? {
                  ...tier,
                  stocks: tier.stocks.map(stock =>
                    stock.id === stockId ? { ...stock, ...updates } : stock
                  )
                }
              : tier
          )
        }));

        const currentState = get();
        internalAPI.saveDataToAPI(currentState);
      },

      removeStockFromTier: (tierId, stockId) => {
        set((state) => ({
          tiers: state.tiers.map(tier =>
            tier.id === tierId
              ? { ...tier, stocks: tier.stocks.filter(stock => stock.id !== stockId) }
              : tier
          )
        }));

        const currentState = get();
        internalAPI.saveDataToAPI(currentState);
      },

      // 予算管理
      updateBudget: (budgetUpdates) => {
        set((state) => {
          const newBudget = { ...state.budget, ...budgetUpdates };

          if (state.selectedFormation && state.tiers.length > 0) {
            const updatedTiers = state.tiers.map(tier => ({
              ...tier,
              targetAmount: (newBudget.funds * tier.percentage) / 100
            }));

            return {
              budget: newBudget,
              tiers: updatedTiers
            };
          }

          return { budget: newBudget };
        });

        const currentState = get();
        internalAPI.saveDataToAPI(currentState);
      },

      calculateBudgetMetrics: () => {
        const { budget } = get();
        if (budget.start > 0) {
          const returnPercentage = ((budget.profit / budget.start) * 100);
          set((state) => ({
            budget: { ...state.budget, returnPercentage }
          }));
        }
      },

      // UI状態管理
      setLoading: (loading: boolean) => {
        set({ isLoading: loading });
      },

      setError: (error: string | null) => {
        set({ error, isLoading: false });
      },

      // フォーメーション使用統計更新
      updateFormationUsage: (formationId: string) => {
        const { formationUsage } = get();
        const now = new Date();

        const existingUsage = formationUsage.find(usage => usage.formationId === formationId);

        if (existingUsage) {
          set(state => ({
            formationUsage: state.formationUsage.map(usage =>
              usage.formationId === formationId
                ? { ...usage, usageCount: usage.usageCount + 1, lastUsed: now }
                : usage
            )
          }));
        } else {
          set(state => ({
            formationUsage: [...state.formationUsage, {
              formationId,
              usageCount: 1,
              usagePercentage: 0,
              lastUsed: now
            }]
          }));
        }
      },

      // 自動保存制御
      enableAutoSave: () => {
        internalAPI.enableAutoSave();
      },

      disableAutoSave: () => {
        internalAPI.disableAutoSave();
      }
    }),
    {
      name: 'app-store'
    }
  )
);

// フォーメーション定義を取得するセレクタ関数
export const getFormationById = (id: string): FormationType | undefined => {
  return FORMATION_DEFINITIONS.find((formation: FormationType) => formation.id === id);
};

// Phase 3.3: 最適化されたhook（UI必要な状態のみ公開）
export const useSelectedFormation = () => useAppStore(state => state.selectedFormation);
export const useTiers = () => useAppStore(state => state.tiers);
export const useBudget = () => useAppStore(state => state.budget);
export const useFormationUsage = () => useAppStore(state => state.formationUsage);
export const useIsLoading = () => useAppStore(state => state.isLoading);
export const useError = () => useAppStore(state => state.error);

// UI操作hook
export const useSelectFormation = () => useAppStore(state => state.selectFormation);
export const useClearFormation = () => useAppStore(state => state.clearFormation);
export const useAddStockToTier = () => useAppStore(state => state.addStockToTier);
export const useUpdateStockInTier = () => useAppStore(state => state.updateStockInTier);
export const useRemoveStockFromTier = () => useAppStore(state => state.removeStockFromTier);
export const useUpdateBudget = () => useAppStore(state => state.updateBudget);
export const useCalculateBudgetMetrics = () => useAppStore(state => state.calculateBudgetMetrics);
export const useSetLoading = () => useAppStore(state => state.setLoading);
export const useSetError = () => useAppStore(state => state.setError);

// 自動保存制御hook
export const useEnableAutoSave = () => useAppStore(state => state.enableAutoSave);
export const useDisableAutoSave = () => useAppStore(state => state.disableAutoSave);

// 自動保存状態確認（読み取り専用）
export const useAutoSaveEnabled = () => internalAPI.isAutoSaveEnabled;
