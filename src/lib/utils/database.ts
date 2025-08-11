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

// データベース接続インスタンス作成
export function createDbConnection(env: CloudflareEnv) {
  return drizzle(env.DB);
}

// データベース操作クラス
export class DatabaseService {
  private db: ReturnType<typeof createDbConnection>;

  constructor(env: CloudflareEnv) {
    this.db = createDbConnection(env);
  }

  // 設定関連操作
  async getSettings(): Promise<SettingsType | null> {
    const result = await this.db
      .select()
      .from(settings)
      .orderBy(desc(settings.updatedAt))
      .limit(1);

    if (result.length === 0) return null;

    const setting = result[0];
    return {
      id: setting.id,
      currentFormationId: setting.currentFormationId,
      lastCheckDate: setting.lastCheckDate,
      autoCheckEnabled: setting.autoCheckEnabled,
      createdAt: setting.createdAt,
      updatedAt: setting.updatedAt
    };
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

  // 予算関連操作
  async getBudget(): Promise<BudgetType | null> {
    const result = await this.db
      .select()
      .from(budget)
      .orderBy(desc(budget.updatedAt))
      .limit(1);

    if (result.length === 0) return null;

    const budgetData = result[0];
    return {
      id: budgetData.id,
      funds: budgetData.funds,
      start: budgetData.start,
      profit: budgetData.profit,
      updatedAt: budgetData.updatedAt
    };
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

  // 保有銘柄関連操作
  async getHoldings(): Promise<HoldingType[]> {
    const result = await this.db
      .select()
      .from(holdings)
      .orderBy(asc(holdings.tier), asc(holdings.ticker));

    return result.map(holding => ({
      id: holding.id,
      ticker: holding.ticker,
      tier: holding.tier,
      entryPrice: holding.entryPrice,
      holdShares: holding.holdShares,
      goalShares: holding.goalShares,
      updatedAt: holding.updatedAt
    }));
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

  // フォーメーション使用統計関連操作
  async getFormationUsage(): Promise<FormationUsageType[]> {
    const result = await this.db
      .select()
      .from(formationUsage)
      .orderBy(desc(formationUsage.lastUsedDate));

    return result.map(usage => ({
      id: usage.id,
      formationId: usage.formationId,
      usageCount: usage.usageCount,
      totalDays: usage.totalDays,
      usagePercentage: usage.usagePercentage,
      lastUsedDate: usage.lastUsedDate,
      createdAt: usage.createdAt
    }));
  }

  async upsertFormationUsage(formationId: string): Promise<FormationUsageType> {
    const existing = await this.db
      .select()
      .from(formationUsage)
      .where(eq(formationUsage.formationId, formationId))
      .limit(1);

    const now = new Date().toISOString();

    if (existing.length > 0) {
      // 既存の使用統計を更新
      const updated = {
        ...existing[0],
        usageCount: existing[0].usageCount + 1,
        totalDays: existing[0].totalDays + 1,
        lastUsedDate: now
      };
      
      // 精密な使用率計算（小数点以下2桁まで）
      updated.usagePercentage = Math.round((updated.usageCount / updated.totalDays) * 10000) / 100;

      await this.db
        .update(formationUsage)
        .set({
          usageCount: updated.usageCount,
          totalDays: updated.totalDays,
          usagePercentage: updated.usagePercentage,
          lastUsedDate: updated.lastUsedDate
        })
        .where(eq(formationUsage.id, existing[0].id));

      return {
        id: updated.id,
        formationId: updated.formationId,
        usageCount: updated.usageCount,
        totalDays: updated.totalDays,
        usagePercentage: updated.usagePercentage,
        lastUsedDate: updated.lastUsedDate,
        createdAt: updated.createdAt
      };
    } else {
      // 新規作成 - 全体のtotalDaysを考慮して初期値を設定
      const allExistingStats = await this.getFormationUsage();
      const globalTotalDays = allExistingStats.length > 0 
        ? Math.max(...allExistingStats.map(stat => stat.totalDays))
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

  // 全データ取得（API用）
  async getAllData() {
    const [settingsData, budgetData, holdingsData, usageData] = await Promise.all([
      this.getSettings(),
      this.getBudget(),
      this.getHoldings(),
      this.getFormationUsage()
    ]);

    return {
      settings: settingsData,
      budget: budgetData,
      holdings: holdingsData,
      usageStats: usageData
    };
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