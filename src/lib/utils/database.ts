// サテライト投資管理アプリ - データベース接続・操作ユーティリティ
import { drizzle } from 'drizzle-orm/d1';
import { eq, desc, asc } from 'drizzle-orm';
import { 
  settings, 
  holdings, 
  budget, 
  formationUsage,
  formationHistory,
  type Settings,
  type Holdings,
  type Budget,
  type FormationUsage,
  type NewSettings,
  type NewHoldings,
  type NewBudget,
  type NewFormationUsage
} from './schema';
import type { CloudflareEnv, BudgetType, HoldingType, FormationUsageType, SettingsType } from './types';

// データベース接続インスタンス作成（接続プール対応）
const connectionCache = new Map<string, ReturnType<typeof drizzle>>();

export function createDbConnection(env: CloudflareEnv) {
  // 接続キャッシュを使用してデータベース接続を再利用
  const cacheKey = env.DB.toString();
  
  if (connectionCache.has(cacheKey)) {
    return connectionCache.get(cacheKey)!;
  }
  
  const db = drizzle(env.DB);
  connectionCache.set(cacheKey, db);
  return db;
}

// データベース操作クラス
export class DatabaseService {
  private db: ReturnType<typeof createDbConnection>;

  constructor(env: CloudflareEnv) {
    this.db = createDbConnection(env);
  }

  // 設定関連操作（インデックス最適化版）
  async getSettings(): Promise<SettingsType | null> {
    // updatedAtインデックスを活用した最適化クエリ
    const result = await this.db
      .select({
        id: settings.id,
        currentFormationId: settings.currentFormationId,
        lastCheckDate: settings.lastCheckDate,
        autoCheckEnabled: settings.autoCheckEnabled,
        createdAt: settings.createdAt,
        updatedAt: settings.updatedAt
      })
      .from(settings)
      .orderBy(desc(settings.updatedAt))
      .limit(1);

    if (result.length === 0) return null;
    return result[0] as SettingsType;
  }

  async upsertSettings(settingsData: Partial<SettingsType>): Promise<SettingsType> {
    const existingSettings = await this.getSettings();
    const now = new Date().toISOString();

    if (existingSettings) {
      // 更新
      const updated = {
        ...existingSettings,
        ...settingsData,
        updatedAt: now
      };

      await this.db
        .update(settings)
        .set({
          currentFormationId: updated.currentFormationId,
          lastCheckDate: updated.lastCheckDate,
          autoCheckEnabled: updated.autoCheckEnabled,
          updatedAt: updated.updatedAt
        })
        .where(eq(settings.id, existingSettings.id));

      return updated;
    } else {
      // 新規作成
      const newSettings: SettingsType = {
        id: `settings-${Date.now()}`,
        currentFormationId: settingsData.currentFormationId || 'formation-3-50-30-20',
        lastCheckDate: settingsData.lastCheckDate || now,
        autoCheckEnabled: settingsData.autoCheckEnabled ?? true,
        createdAt: now,
        updatedAt: now
      };

      await this.db.insert(settings).values({
        id: newSettings.id,
        currentFormationId: newSettings.currentFormationId,
        lastCheckDate: newSettings.lastCheckDate,
        autoCheckEnabled: newSettings.autoCheckEnabled,
        createdAt: newSettings.createdAt,
        updatedAt: newSettings.updatedAt
      });

      return newSettings;
    }
  }

  // 予算関連操作（インデックス最適化版）
  async getBudget(): Promise<BudgetType | null> {
    // updatedAtインデックスを活用した最適化クエリ
    const result = await this.db
      .select({
        id: budget.id,
        funds: budget.funds,
        start: budget.start,
        profit: budget.profit,
        updatedAt: budget.updatedAt
      })
      .from(budget)
      .orderBy(desc(budget.updatedAt))
      .limit(1);

    if (result.length === 0) return null;
    return result[0] as BudgetType;
  }

  async upsertBudget(budgetData: Partial<BudgetType>): Promise<BudgetType> {
    const existingBudget = await this.getBudget();
    const now = new Date().toISOString();

    if (existingBudget) {
      // 更新
      const updated = {
        ...existingBudget,
        ...budgetData,
        updatedAt: now
      };

      await this.db
        .update(budget)
        .set({
          funds: updated.funds,
          start: updated.start,
          profit: updated.profit,
          updatedAt: updated.updatedAt
        })
        .where(eq(budget.id, existingBudget.id));

      return updated;
    } else {
      // 新規作成
      const newBudget: BudgetType = {
        id: `budget-${Date.now()}`,
        funds: budgetData.funds || 6000,
        start: budgetData.start || 6000,
        profit: budgetData.profit || 0,
        updatedAt: now
      };

      await this.db.insert(budget).values({
        id: newBudget.id,
        funds: newBudget.funds,
        start: newBudget.start,
        profit: newBudget.profit,
        updatedAt: newBudget.updatedAt
      });

      return newBudget;
    }
  }

  // 保有銘柄関連操作（複合インデックス最適化版）
  async getHoldings(): Promise<HoldingType[]> {
    // ticker_tier複合インデックスを活用した最適化クエリ
    const result = await this.db
      .select({
        id: holdings.id,
        ticker: holdings.ticker,
        tier: holdings.tier,
        entryPrice: holdings.entryPrice,
        holdShares: holdings.holdShares,
        goalShares: holdings.goalShares,
        updatedAt: holdings.updatedAt
      })
      .from(holdings)
      .orderBy(asc(holdings.tier), asc(holdings.ticker));

    return result as HoldingType[];
  }

  async upsertHolding(holdingData: HoldingType): Promise<HoldingType> {
    const existing = await this.db
      .select()
      .from(holdings)
      .where(eq(holdings.id, holdingData.id))
      .limit(1);

    const now = new Date().toISOString();
    const updated = {
      ...holdingData,
      updatedAt: now
    };

    if (existing.length > 0) {
      // 更新
      await this.db
        .update(holdings)
        .set({
          ticker: updated.ticker,
          tier: updated.tier,
          entryPrice: updated.entryPrice,
          holdShares: updated.holdShares,
          goalShares: updated.goalShares,
          updatedAt: updated.updatedAt
        })
        .where(eq(holdings.id, holdingData.id));
    } else {
      // 新規作成
      await this.db.insert(holdings).values({
        id: updated.id,
        ticker: updated.ticker,
        tier: updated.tier,
        entryPrice: updated.entryPrice,
        holdShares: updated.holdShares,
        goalShares: updated.goalShares,
        updatedAt: updated.updatedAt
      });
    }

    return updated;
  }

  async deleteHolding(holdingId: string): Promise<void> {
    await this.db.delete(holdings).where(eq(holdings.id, holdingId));
  }

  async clearAllHoldings(): Promise<void> {
    await this.db.delete(holdings);
  }

  // フォーメーション使用統計関連操作（インデックス最適化版）
  async getFormationUsage(): Promise<FormationUsageType[]> {
    // lastUsedDateでのソートが多いため、インデックスを活用
    const result = await this.db
      .select({
        id: formationUsage.id,
        formationId: formationUsage.formationId,
        usageCount: formationUsage.usageCount,
        totalDays: formationUsage.totalDays,
        usagePercentage: formationUsage.usagePercentage,
        lastUsedDate: formationUsage.lastUsedDate,
        createdAt: formationUsage.createdAt
      })
      .from(formationUsage)
      .orderBy(desc(formationUsage.lastUsedDate));

    return result as FormationUsageType[];
  }

  async upsertFormationUsage(formationId: string): Promise<FormationUsageType> {
    const startTime = Date.now();
    
    // 最適化されたクエリ：必要なフィールドのみ取得
    const existing = await this.db
      .select({
        id: formationUsage.id,
        formationId: formationUsage.formationId,
        usageCount: formationUsage.usageCount,
        totalDays: formationUsage.totalDays,
        createdAt: formationUsage.createdAt
      })
      .from(formationUsage)
      .where(eq(formationUsage.formationId, formationId))
      .limit(1);

    const now = new Date().toISOString();

    if (existing.length > 0) {
      // 既存の使用統計を更新（インライン計算で高速化）
      const currentUsage = existing[0];
      const newUsageCount = currentUsage.usageCount + 1;
      const newTotalDays = currentUsage.totalDays + 1;
      const newUsagePercentage = Math.round((newUsageCount / newTotalDays) * 10000) / 100;

      await this.db
        .update(formationUsage)
        .set({
          usageCount: newUsageCount,
          totalDays: newTotalDays,
          usagePercentage: newUsagePercentage,
          lastUsedDate: now
        })
        .where(eq(formationUsage.id, currentUsage.id));

      const result = {
        id: currentUsage.id,
        formationId: currentUsage.formationId,
        usageCount: newUsageCount,
        totalDays: newTotalDays,
        usagePercentage: newUsagePercentage,
        lastUsedDate: now,
        createdAt: currentUsage.createdAt
      };
      
      if (process.env.NODE_ENV === 'development') {
        console.log(`upsertFormationUsage (update) completed in ${Date.now() - startTime}ms`);
      }
      
      return result;
    } else {
      // 新規作成：グローバルtotalDays取得を最適化
      const maxTotalDaysResult = await this.db
        .select({ maxTotal: formationUsage.totalDays })
        .from(formationUsage)
        .orderBy(desc(formationUsage.totalDays))
        .limit(1);
        
      const globalTotalDays = maxTotalDaysResult.length > 0 
        ? maxTotalDaysResult[0].maxTotal 
        : 1;

      const newUsage: FormationUsageType = {
        id: `usage-${formationId}-${Date.now()}`,
        formationId,
        usageCount: 1,
        totalDays: globalTotalDays,
        usagePercentage: Math.round((1 / globalTotalDays) * 10000) / 100,
        lastUsedDate: now,
        createdAt: now
      };

      await this.db.insert(formationUsage).values({
        id: newUsage.id,
        formationId: newUsage.formationId,
        usageCount: newUsage.usageCount,
        totalDays: newUsage.totalDays,
        usagePercentage: newUsage.usagePercentage,
        lastUsedDate: newUsage.lastUsedDate,
        createdAt: newUsage.createdAt
      });

      if (process.env.NODE_ENV === 'development') {
        console.log(`upsertFormationUsage (insert) completed in ${Date.now() - startTime}ms`);
      }

      return newUsage;
    }
  }

  // 使用率再計算（メンテナンス用）
  async recalculateAllUsagePercentages(): Promise<FormationUsageType[]> {
    const allStats = await this.getFormationUsage();
    const updatedStats: FormationUsageType[] = [];

    for (const stat of allStats) {
      if (stat.totalDays > 0) {
        const newUsagePercentage = Math.round((stat.usageCount / stat.totalDays) * 10000) / 100;
        
        await this.db
          .update(formationUsage)
          .set({
            usagePercentage: newUsagePercentage
          })
          .where(eq(formationUsage.id, stat.id));

        updatedStats.push({
          ...stat,
          usagePercentage: newUsagePercentage
        });
      } else {
        updatedStats.push(stat);
      }
    }

    return updatedStats;
  }

  // フォーメーション変更検知とカウント更新
  async checkFormationChangeAndUpdate(): Promise<{
    hasChanged: boolean;
    previousFormation: string | null;
    currentFormation: string;
    updateResult?: FormationUsageType;
  }> {
    const currentSettings = await this.getSettings();
    if (!currentSettings) {
      throw new DatabaseError('Settings not found. Please initialize the database first.');
    }

    const today = new Date().toISOString().split('T')[0]; // YYYY-MM-DD
    const lastCheckDate = currentSettings.lastCheckDate.split('T')[0];
    const currentFormationId = currentSettings.currentFormationId;

    // 前日のフォーメーション情報を取得（履歴から）
    const recentHistory = await this.db
      .select()
      .from(formationHistory)
      .orderBy(desc(formationHistory.changedAt))
      .limit(1);

    const previousFormationId = recentHistory.length > 0 
      ? recentHistory[0].fromFormationId 
      : null;

    // 日付が変わっている場合のみチェック実行
    if (lastCheckDate === today) {
      return {
        hasChanged: false,
        previousFormation: previousFormationId,
        currentFormation: currentFormationId
      };
    }

    // フォーメーション変更があったかチェック
    const hasFormationChanged = previousFormationId && previousFormationId !== currentFormationId;

    if (hasFormationChanged) {
      // フォーメーション変更履歴を記録
      await this.db.insert(formationHistory).values({
        id: `history-${Date.now()}`,
        fromFormationId: previousFormationId,
        toFormationId: currentFormationId,
        changedAt: new Date().toISOString(),
        reason: 'Daily check detected change'
      });
    }

    // 現在のフォーメーションの使用統計を更新
    const updateResult = await this.upsertFormationUsage(currentFormationId);

    // 他の全フォーメーションのtotalDaysを増加
    await this.incrementTotalDaysForAllFormations(currentFormationId);

    // 設定のlastCheckDateを更新
    await this.upsertSettings({
      lastCheckDate: new Date().toISOString()
    });

    return {
      hasChanged: hasFormationChanged || false,
      previousFormation: previousFormationId,
      currentFormation: currentFormationId,
      updateResult
    };
  }

  // 全フォーメーションのtotalDaysを増加（現在使用中以外）
  private async incrementTotalDaysForAllFormations(currentFormationId: string): Promise<void> {
    const allUsageStats = await this.getFormationUsage();
    
    for (const usage of allUsageStats) {
      if (usage.formationId !== currentFormationId) {
        const newTotalDays = usage.totalDays + 1;
        const newUsagePercentage = Math.round((usage.usageCount / newTotalDays) * 10000) / 100;

        await this.db
          .update(formationUsage)
          .set({
            totalDays: newTotalDays,
            usagePercentage: newUsagePercentage
          })
          .where(eq(formationUsage.id, usage.id));
      }
    }
  }

  // 全データ取得（API用）- パフォーマンス最適化版
  async getAllData() {
    const startTime = Date.now();
    
    // より効率的な並行処理でデータ取得
    const [settingsData, budgetData, holdingsData, usageData] = await Promise.allSettled([
      this.getSettings(),
      this.getBudget(), 
      this.getHoldings(),
      this.getFormationUsage()
    ]);

    // エラーハンドリングと結果処理
    const result = {
      settings: settingsData.status === 'fulfilled' ? settingsData.value : null,
      budget: budgetData.status === 'fulfilled' ? budgetData.value : null,
      holdings: holdingsData.status === 'fulfilled' ? holdingsData.value : [],
      usageStats: usageData.status === 'fulfilled' ? usageData.value : []
    };
    
    // パフォーマンス測定（開発環境のみ）
    if (process.env.NODE_ENV === 'development') {
      console.log(`DatabaseService.getAllData completed in ${Date.now() - startTime}ms`);
    }
    
    return result;
  }

  // データベース初期化（テスト用）
  async initializeDatabase() {
    // 初期設定を挿入
    await this.upsertSettings({
      currentFormationId: 'formation-3-50-30-20',
      lastCheckDate: new Date().toISOString(),
      autoCheckEnabled: true
    });

    // 初期予算を挿入
    await this.upsertBudget({
      funds: 6000,
      start: 6000,
      profit: 0
    });

    console.log('Database initialized with default data');
  }
}

// ヘルパー関数
export function createDatabaseService(env: CloudflareEnv): DatabaseService {
  return new DatabaseService(env);
}

// エラーハンドリング用
export class DatabaseError extends Error {
  public readonly errorType: 'CONNECTION' | 'TIMEOUT' | 'AUTHENTICATION' | 'QUERY' | 'CONSTRAINT' | 'UNKNOWN';
  
  constructor(message: string, public cause?: Error, errorType: DatabaseError['errorType'] = 'UNKNOWN') {
    super(message);
    this.name = 'DatabaseError';
    this.errorType = errorType;
  }
  
  static fromError(error: Error): DatabaseError {
    const message = error.message.toLowerCase();
    
    if (message.includes('timeout') || message.includes('timed out')) {
      return new DatabaseError('データベース接続がタイムアウトしました', error, 'TIMEOUT');
    }
    
    if (message.includes('connection') || message.includes('connect')) {
      return new DatabaseError('データベースへの接続に失敗しました', error, 'CONNECTION');
    }
    
    if (message.includes('auth') || message.includes('credential') || message.includes('permission')) {
      return new DatabaseError('データベース認証に失敗しました', error, 'AUTHENTICATION');
    }
    
    if (message.includes('constraint') || message.includes('duplicate') || message.includes('foreign key')) {
      return new DatabaseError('データベース制約違反が発生しました', error, 'CONSTRAINT');
    }
    
    if (message.includes('query') || message.includes('syntax') || message.includes('sql')) {
      return new DatabaseError('データベースクエリの実行に失敗しました', error, 'QUERY');
    }
    
    return new DatabaseError(`データベースエラーが発生しました: ${error.message}`, error, 'UNKNOWN');
  }
}

export function handleDatabaseError(error: unknown): DatabaseError {
  if (error instanceof DatabaseError) {
    return error;
  }
  
  if (error instanceof Error) {
    return DatabaseError.fromError(error);
  }
  
  return new DatabaseError('不明なデータベースエラーが発生しました', undefined, 'UNKNOWN');
}