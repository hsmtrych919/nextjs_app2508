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
}

// ストアの型定義
type AppStore = AppStateType & AppActions;

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
            
            // リターン率を自動計算
            if (newBudget.start > 0) {
              newBudget.returnPercentage = ((newBudget.profit / newBudget.start) * 100);
            }
            
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