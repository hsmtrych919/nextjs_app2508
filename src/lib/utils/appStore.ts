import { create } from 'zustand';
import { devtools, persist } from 'zustand/middleware';
import {
  AppStateType,
  FormationType,
  TierType,
  BudgetType,
  FormationUsageType,
  StockHoldingType,
  FORMATION_DEFINITIONS
} from '../constants/types';
// Agent2のAPI統合型を追加インポート
import type {
  HoldingType as Agent2HoldingType,
  BudgetType as Agent2BudgetType,
  FormationType as Agent2FormationType,
  FORMATIONS
} from './types';
// APIクライアント
import {
  fetchAllData,
  saveAllData,
  saveBudget,
  saveHoldings,
  saveFormation,
  ApiError,
  isApiError,
  getErrorMessage,
  logApiError
} from './api-client';

// 型変換ユーティリティのインポート
import {
  convertAgent1ToAgent2Holding,
  convertAgent2ToAgent1Holding,
  convertAgent1ToAgent2Formation,
  convertAgent2ToAgent1Formation,
  convertAgent2ToAgent1FormationUsage,
  convertHoldingsAgent1ToAgent2,
  convertHoldingsAgent2ToAgent1,
  convertFormationUsageAgent2ToAgent1
} from './type-converters';

// アクション関数の型定義
interface AppActions {
  // フォーメーション管理
  setSelectedFormation: (formation: FormationType) => void;
  clearFormation: () => void;

  // Tier管理
  updateTier: (tierId: string, updates: Partial<TierType>) => void;
  addStockToTier: (tierId: string, stock: StockHoldingType) => void;
  updateStockInTier: (tierId: string, stockId: string, updates: Partial<StockHoldingType>) => void;
  removeStockFromTier: (tierId: string, stockId: string) => void;

  // 予算管理
  updateBudget: (budget: Partial<BudgetType>) => void;
  calculateBudgetMetrics: () => void;

  // フォーメーション使用統計
  updateFormationUsage: (formationId: string) => void;
  getFormationUsagePercentage: (formationId: string) => number;

  // データ管理
  loadData: (data: Partial<AppStateType>) => void;
  resetAllData: () => void;

  // UI状態管理
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;

  // API連携アクション
  loadDataFromAPI: () => Promise<void>;
  saveDataToAPI: () => Promise<void>;
  saveBudgetToAPI: (budget: Partial<BudgetType>) => Promise<void>;
  saveHoldingsToAPI: (holdings: StockHoldingType[]) => Promise<void>;
  saveFormationToAPI: (formationId: string) => Promise<void>;

  // 自動保存設定
  enableAutoSave: () => void;
  disableAutoSave: () => void;
  isAutoSaveEnabled: boolean;
}

// ストアの型定義
type AppStore = AppStateType & AppActions;

// 初期状態の定義
const initialState: AppStateType & { isAutoSaveEnabled: boolean } = {
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
  error: null,
  isAutoSaveEnabled: true
};

// Tier初期化関数
const createInitialTiers = (formation: FormationType, totalFunds: number): TierType[] => {
  return formation.percentages.map((percentage, index) => ({
    id: `tier_${index + 1}`,
    percentage,
    targetAmount: totalFunds * (percentage / 100),
    stocks: []
  }));
};

// Zustandストアの作成
export const useAppStore = create<AppStore>()(
  devtools(
    persist(
      (set, get) => ({
        ...initialState,

        // フォーメーション管理
        setSelectedFormation: (formation) => {
          const { budget } = get();
          const newTiers = createInitialTiers(formation, budget.funds);

          set((state) => ({
            selectedFormation: formation,
            tiers: newTiers,
            error: null
          }));

          // フォーメーション使用統計を更新
          get().updateFormationUsage(formation.id);
        },

        clearFormation: () => {
          set({
            selectedFormation: null,
            tiers: [],
            error: null
          });
        },

        // Tier管理
        updateTier: (tierId, updates) => {
          set((state) => ({
            tiers: state.tiers.map(tier =>
              tier.id === tierId ? { ...tier, ...updates } : tier
            )
          }));
        },

        addStockToTier: (tierId, stock) => {
          set((state) => ({
            tiers: state.tiers.map(tier =>
              tier.id === tierId
                ? { ...tier, stocks: [...tier.stocks, stock] }
                : tier
            )
          }));
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
        },

        removeStockFromTier: (tierId, stockId) => {
          set((state) => ({
            tiers: state.tiers.map(tier =>
              tier.id === tierId
                ? { ...tier, stocks: tier.stocks.filter(stock => stock.id !== stockId) }
                : tier
            )
          }));
        },

        // 予算管理
        updateBudget: (budgetUpdates) => {
          set((state) => {
            const newBudget = { ...state.budget, ...budgetUpdates };

            // フォーメーション選択時はTierの目標金額も更新
            let updatedTiers = state.tiers;
            if (state.selectedFormation && budgetUpdates.funds) {
              updatedTiers = state.tiers.map(tier => ({
                ...tier,
                targetAmount: budgetUpdates.funds! * (tier.percentage / 100)
              }));
            }

            return {
              budget: newBudget,
              tiers: updatedTiers
            };
          });
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

        // フォーメーション使用統計
        updateFormationUsage: (formationId) => {
          set((state) => {
            const existingUsage = state.formationUsage.find(u => u.formationId === formationId);

            let newFormationUsage;
            if (existingUsage) {
              newFormationUsage = state.formationUsage.map(usage =>
                usage.formationId === formationId
                  ? {
                      ...usage,
                      usageCount: usage.usageCount + 1,
                      lastUsed: new Date()
                    }
                  : usage
              );
            } else {
              newFormationUsage = [
                ...state.formationUsage,
                {
                  formationId,
                  usageCount: 1,
                  usagePercentage: 0,
                  lastUsed: new Date()
                }
              ];
            }

            // 使用率を再計算
            const totalUsage = newFormationUsage.reduce((sum, usage) => sum + usage.usageCount, 0);
            if (totalUsage > 0) {
              newFormationUsage = newFormationUsage.map(usage => ({
                ...usage,
                usagePercentage: Math.round((usage.usageCount / totalUsage) * 100)
              }));
            }

            return { formationUsage: newFormationUsage };
          });
        },

        getFormationUsagePercentage: (formationId) => {
          const usage = get().formationUsage.find(u => u.formationId === formationId);
          return usage?.usagePercentage || 0;
        },

        // データ管理
        loadData: (data) => {
          set((state) => ({ ...state, ...data, isLoading: false }));
        },

        resetAllData: () => {
          set(initialState);
        },

        // UI状態管理
        setLoading: (loading) => {
          set({ isLoading: loading });
        },

        setError: (error) => {
          set({ error, isLoading: false });
        },

        // API連携アクション
        loadDataFromAPI: async () => {
          set({ isLoading: true, error: null });

          try {
            const apiData = await fetchAllData();

            // Agent2のフォーメーション形式をAgent1形式に変換
            const agent1Formations = apiData.formations.map(f => ({
              id: f.id.replace(/-/g, '_'), // IDをAgent1形式に変換
              name: f.name,
              tiers: f.tiers,
              percentages: f.targetPercentages
            }));

            // Agent2のHolding形式をAgent1のStockHolding形式に変換
            const agent1Holdings = convertHoldingsAgent2ToAgent1(apiData.holdings);

            // 設定からフォーメーションを特定
            let selectedFormation = null;
            if (apiData.settings.currentFormationId) {
              const formationId = apiData.settings.currentFormationId.replace(/-/g, '_');
              selectedFormation = FORMATION_DEFINITIONS.find(f => f.id === formationId) || null;
            }

            // フォーメーション使用統計を変換
            const formationUsage = convertFormationUsageAgent2ToAgent1(apiData.usageStats);

            // Tierを再構築（選択中のフォーメーションから）
            let newTiers: TierType[] = [];
            if (selectedFormation) {
              newTiers = createInitialTiers(selectedFormation, apiData.budget.funds);

              // 保有銘柄をTierに配置（簡易実装）
              agent1Holdings.forEach(holding => {
                const tier = newTiers[0]; // 暫定的に最初のTierに配置
                if (tier) {
                  tier.stocks.push(holding);
                }
              });
            }

            // ストア状態を更新
            set({
              selectedFormation,
              tiers: newTiers,
              budget: {
                funds: apiData.budget.funds,
                start: apiData.budget.start,
                profit: apiData.budget.profit,
                returnPercentage: apiData.budget.returnPercentage || 0
              },
              formationUsage,
              isLoading: false,
              error: null
            });

          } catch (error) {
            logApiError(error, 'loadDataFromAPI');
            set({
              error: getErrorMessage(error),
              isLoading: false
            });
          }
        },

        saveDataToAPI: async () => {
          const { selectedFormation, tiers, budget, isAutoSaveEnabled } = get();

          if (!isAutoSaveEnabled) return;

          set({ isLoading: true, error: null });

          try {
            // Tierから全ての保有銘柄を抽出
            const allStocks = tiers.flatMap(tier => tier.stocks);

            // Agent1形式をAgent2形式に変換
            const agent2Holdings = convertHoldingsAgent1ToAgent2(allStocks);

            // API形式の予算データに変換
            const budgetData = {
              funds: budget.funds,
              start: budget.start,
              profit: budget.profit
            };

            const requestData = {
              budget: budgetData,
              holdings: agent2Holdings,
              formationId: selectedFormation?.id.replace(/_/g, '-') || undefined
            };

            await saveAllData(requestData);

            set({ isLoading: false, error: null });

          } catch (error) {
            logApiError(error, 'saveDataToAPI');
            set({
              error: getErrorMessage(error),
              isLoading: false
            });
          }
        },

        saveBudgetToAPI: async (budgetUpdates) => {
          set({ isLoading: true, error: null });

          try {
            const updatedBudget = await saveBudget(budgetUpdates);

            set((state) => ({
              budget: {
                ...state.budget,
                funds: updatedBudget.funds,
                start: updatedBudget.start,
                profit: updatedBudget.profit,
                returnPercentage: updatedBudget.returnPercentage || 0
              },
              isLoading: false,
              error: null
            }));

          } catch (error) {
            logApiError(error, 'saveBudgetToAPI');
            set({
              error: getErrorMessage(error),
              isLoading: false
            });
          }
        },

        saveHoldingsToAPI: async (holdings) => {
          set({ isLoading: true, error: null });

          try {
            const agent2Holdings = convertHoldingsAgent1ToAgent2(holdings);
            await saveHoldings(agent2Holdings);

            set({ isLoading: false, error: null });

          } catch (error) {
            logApiError(error, 'saveHoldingsToAPI');
            set({
              error: getErrorMessage(error),
              isLoading: false
            });
          }
        },

        saveFormationToAPI: async (formationId) => {
          set({ isLoading: true, error: null });

          try {
            const agent2FormationId = formationId.replace(/_/g, '-');
            const result = await saveFormation(agent2FormationId);

            // 使用統計を更新
            const updatedUsage = convertFormationUsageAgent2ToAgent1(result.usageStats);

            set((state) => ({
              formationUsage: updatedUsage,
              isLoading: false,
              error: null
            }));

          } catch (error) {
            logApiError(error, 'saveFormationToAPI');
            set({
              error: getErrorMessage(error),
              isLoading: false
            });
          }
        },

        // 自動保存設定
        enableAutoSave: () => {
          set({ isAutoSaveEnabled: true });
        },

        disableAutoSave: () => {
          set({ isAutoSaveEnabled: false });
        }
      }),
      {
        name: 'satellite-investment-store',
        version: 1
      }
    ),
    {
      name: 'satellite-investment-store'
    }
  )
);

// フォーメーション定義を取得するセレクタ関数
export const getFormationById = (id: string): FormationType | undefined => {
  return FORMATION_DEFINITIONS.find(formation => formation.id === id);
};

// 便利なセレクタフック
export const useSelectedFormation = () => useAppStore(state => state.selectedFormation);
export const useTiers = () => useAppStore(state => state.tiers);
export const useBudget = () => useAppStore(state => state.budget);
export const useFormationUsage = () => useAppStore(state => state.formationUsage);
export const useIsLoading = () => useAppStore(state => state.isLoading);
export const useError = () => useAppStore(state => state.error);

// API関連のセレクタフック
export const useLoadDataFromAPI = () => useAppStore(state => state.loadDataFromAPI);
export const useSaveDataToAPI = () => useAppStore(state => state.saveDataToAPI);
export const useSaveBudgetToAPI = () => useAppStore(state => state.saveBudgetToAPI);
export const useSaveHoldingsToAPI = () => useAppStore(state => state.saveHoldingsToAPI);
export const useSaveFormationToAPI = () => useAppStore(state => state.saveFormationToAPI);
export const useAutoSaveEnabled = () => useAppStore(state => state.isAutoSaveEnabled);
export const useEnableAutoSave = () => useAppStore(state => state.enableAutoSave);
export const useDisableAutoSave = () => useAppStore(state => state.disableAutoSave);