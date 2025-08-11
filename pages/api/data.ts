// サテライト投資管理アプリ - メインデータAPI
// Agent 2 Phase 2-1: データCRUD API実装完成版
import type { NextApiRequest, NextApiResponse } from 'next';
import { createDatabaseService, handleDatabaseError, DatabaseError } from '../../src/lib/utils/database';
import { FORMATIONS, API_ERROR_CODES, TICKER_SYMBOLS } from '../../src/lib/utils/types';
import type { 
  ApiDataRequest, 
  ApiDataResponse, 
  CloudflareEnv,
  HoldingType,
  BudgetType,
  SettingsType,
  FormationUsageType,
  TickerSymbol,
  ApiErrorCode
} from '../../src/lib/utils/types';

// 開発環境用の最適化されたメモリ内データストレージ
const developmentStorage = {
  settings: null as SettingsType | null,
  budget: null as BudgetType | null,
  holdings: [] as HoldingType[],
  usageStats: [] as FormationUsageType[],
  // メモリ使用量削減のためのキャッシュ
  _cache: new Map<string, { data: any; timestamp: number; ttl: number }>()
};

// Cloudflare環境変数の取得
function getCloudflareEnv(): CloudflareEnv | null {
  if (process.env.NODE_ENV === 'development') {
    return null; // 開発環境ではメモリストレージを使用
  }
  return (global as any).__env__ as CloudflareEnv;
}

// リクエストバリデーション関数
function validateApiDataRequest(data: unknown): { valid: boolean; error?: string; errorCode?: ApiErrorCode } {
  if (!data || typeof data !== 'object') {
    return { 
      valid: false, 
      error: 'リクエストボディは有効なJSONオブジェクトである必要があります',
      errorCode: API_ERROR_CODES.VALIDATION_ERROR
    };
  }

  const request = data as Partial<ApiDataRequest>;

  // 予算バリデーション
  if (request.budget) {
    const { funds, start, profit } = request.budget;
    if (funds !== undefined && (typeof funds !== 'number' || funds < 0)) {
      return { 
        valid: false, 
        error: '予算の資金は0以上の数値である必要があります',
        errorCode: API_ERROR_CODES.VALIDATION_ERROR
      };
    }
    if (start !== undefined && (typeof start !== 'number' || start < 0)) {
      return { 
        valid: false, 
        error: '予算の開始金額は0以上の数値である必要があります',
        errorCode: API_ERROR_CODES.VALIDATION_ERROR
      };
    }
    if (profit !== undefined && typeof profit !== 'number') {
      return { 
        valid: false, 
        error: '予算の利益は数値である必要があります',
        errorCode: API_ERROR_CODES.VALIDATION_ERROR
      };
    }
  }

  // 保有銘柄バリデーション
  if (request.holdings && Array.isArray(request.holdings)) {
    for (let index = 0; index < request.holdings.length; index++) {
      const holding = request.holdings[index];
      if (!holding.id || !holding.ticker || typeof holding.tier !== 'number') {
        return { 
          valid: false, 
          error: `保有銘柄[${index}]: ID、ティッカーシンボル、階層が必要です`,
          errorCode: API_ERROR_CODES.VALIDATION_ERROR
        };
      }
      
      if (!TICKER_SYMBOLS.includes(holding.ticker as TickerSymbol)) {
        return { 
          valid: false, 
          error: `保有銘柄[${index}]: 無効なティッカーシンボル: ${holding.ticker}`,
          errorCode: API_ERROR_CODES.VALIDATION_ERROR
        };
      }

      if (holding.tier < 1 || holding.tier > 5) {
        return { 
          valid: false, 
          error: `保有銘柄[${index}]: 階層は1から5の間である必要があります`,
          errorCode: API_ERROR_CODES.VALIDATION_ERROR
        };
      }

      if (typeof holding.entryPrice !== 'number' || holding.entryPrice <= 0) {
        return { 
          valid: false, 
          error: `保有銘柄[${index}]: 取得価格は正の数値である必要があります`,
          errorCode: API_ERROR_CODES.VALIDATION_ERROR
        };
      }

      if (typeof holding.holdShares !== 'number' || holding.holdShares < 0) {
        return { 
          valid: false, 
          error: `保有銘柄[${index}]: 保有株数は0以上の数値である必要があります`,
          errorCode: API_ERROR_CODES.VALIDATION_ERROR
        };
      }

      if (typeof holding.goalShares !== 'number' || holding.goalShares <= 0) {
        return { 
          valid: false, 
          error: `保有銘柄[${index}]: 目標株数は正の数値である必要があります`,
          errorCode: API_ERROR_CODES.VALIDATION_ERROR
        };
      }
    }
  }

  // フォーメーションIDバリデーション
  if (request.formationId) {
    const validFormations = FORMATIONS.map(f => f.id);
    if (!validFormations.includes(request.formationId)) {
      return { 
        valid: false, 
        error: `無効なフォーメーションID: ${request.formationId}`,
        errorCode: API_ERROR_CODES.INVALID_FORMATION
      };
    }
  }

  return { valid: true };
}

// 開発環境用の最適化されたモックデータベースサービス
class MockDatabaseService {
  private getCachedData<T>(key: string, producer: () => T, ttlMs: number = 30000): T {
    const cached = developmentStorage._cache.get(key);
    const now = Date.now();
    
    if (cached && now - cached.timestamp < cached.ttl) {
      return cached.data as T;
    }
    
    const data = producer();
    developmentStorage._cache.set(key, { data, timestamp: now, ttl: ttlMs });
    return data;
  }
  
  async getAllData() {
    const startTime = Date.now();
    
    const result = this.getCachedData('getAllData', () => ({
      settings: developmentStorage.settings,
      budget: developmentStorage.budget,
      holdings: [...developmentStorage.holdings], // シャローコピーでメモリ効率化
      usageStats: [...developmentStorage.usageStats]
    }), 5000); // 5秒キャッシュ
    
    console.log(`MockDatabaseService.getAllData completed in ${Date.now() - startTime}ms`);
    return result;
  }

  async upsertBudget(budgetData: Partial<BudgetType>): Promise<BudgetType> {
    const now = new Date().toISOString();
    const updated: BudgetType = {
      id: developmentStorage.budget?.id || `dev-budget-${Date.now()}`,
      funds: budgetData.funds ?? developmentStorage.budget?.funds ?? 6000,
      start: budgetData.start ?? developmentStorage.budget?.start ?? 6000,
      profit: budgetData.profit ?? developmentStorage.budget?.profit ?? 0,
      updatedAt: now,
      ...budgetData
    };
    developmentStorage.budget = updated;
    
    // キャッシュをクリアして一貫性を保つ
    developmentStorage._cache.delete('getAllData');
    
    return updated;
  }

  async upsertSettings(settingsData: Partial<SettingsType>): Promise<SettingsType> {
    const now = new Date().toISOString();
    const updated: SettingsType = {
      id: developmentStorage.settings?.id || `dev-settings-${Date.now()}`,
      currentFormationId: settingsData.currentFormationId ?? developmentStorage.settings?.currentFormationId ?? 'formation-3-50-30-20',
      lastCheckDate: settingsData.lastCheckDate ?? now,
      autoCheckEnabled: settingsData.autoCheckEnabled ?? developmentStorage.settings?.autoCheckEnabled ?? true,
      createdAt: developmentStorage.settings?.createdAt ?? now,
      updatedAt: now
    };
    developmentStorage.settings = updated;
    return updated;
  }

  async clearAllHoldings(): Promise<void> {
    developmentStorage.holdings.length = 0; // メモリ効率的な配列クリア
    developmentStorage._cache.delete('getAllData');
  }

  async upsertHolding(holding: HoldingType): Promise<HoldingType> {
    const now = new Date().toISOString();
    const updatedHolding: HoldingType = {
      ...holding,
      updatedAt: now
    };
    
    const existingIndex = developmentStorage.holdings.findIndex(h => h.id === holding.id);
    if (existingIndex >= 0) {
      developmentStorage.holdings[existingIndex] = updatedHolding;
    } else {
      developmentStorage.holdings.push(updatedHolding);
    }
    
    // キャッシュをクリア
    developmentStorage._cache.delete('getAllData');
    
    return updatedHolding;
  }

  async upsertFormationUsage(formationId: string): Promise<FormationUsageType> {
    const now = new Date().toISOString();
    const existingIndex = developmentStorage.usageStats.findIndex(u => u.formationId === formationId);
    
    if (existingIndex >= 0) {
      const existing = developmentStorage.usageStats[existingIndex];
      const updated: FormationUsageType = {
        ...existing,
        usageCount: existing.usageCount + 1,
        totalDays: existing.totalDays + 1,
        usagePercentage: ((existing.usageCount + 1) / (existing.totalDays + 1)) * 100,
        lastUsedDate: now
      };
      developmentStorage.usageStats[existingIndex] = updated;
      return updated;
    } else {
      const newUsage: FormationUsageType = {
        id: `dev-usage-${formationId}-${Date.now()}`,
        formationId,
        usageCount: 1,
        totalDays: 1,
        usagePercentage: 100,
        lastUsedDate: now,
        createdAt: now
      };
      developmentStorage.usageStats.push(newUsage);
      return newUsage;
    }
  }
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<ApiDataResponse>
) {
  const startTime = Date.now();
  const requestId = req.headers['x-request-id'] as string || `req-${Date.now()}`;

  try {
    // データベースサービス初期化
    const env = getCloudflareEnv();
    const dbService = env ? createDatabaseService(env) : new MockDatabaseService();

    if (req.method === 'GET') {
      // Phase 2-1: GET /api/data 完全実装
      try {
        const data = await dbService.getAllData();
        
        const response: ApiDataResponse = {
          success: true,
          timestamp: new Date().toISOString(),
          data: {
            budget: data.budget || {
              id: `default-budget-${Date.now()}`,
              funds: 6000,
              start: 6000,
              profit: 0,
              updatedAt: new Date().toISOString()
            },
            holdings: data.holdings || [],
            settings: data.settings || {
              id: `default-settings-${Date.now()}`,
              currentFormationId: 'formation-3-50-30-20',
              lastCheckDate: new Date().toISOString(),
              autoCheckEnabled: true,
              createdAt: new Date().toISOString(),
              updatedAt: new Date().toISOString()
            },
            formations: FORMATIONS,
            usageStats: data.usageStats || []
          }
        };

        const processingTime = Date.now() - startTime;
        console.log(`[${requestId}] GET /api/data completed in ${processingTime}ms`);
        
        // パフォーマンスメトリクスをレスポンスヘッダーに追加
        if (process.env.NODE_ENV === 'development') {
          res.setHeader('X-Response-Time', `${processingTime}ms`);
          res.setHeader('X-Data-Size', JSON.stringify(response).length.toString());
        }
        
        res.status(200).json(response);

      } catch (dbError) {
        throw new DatabaseError('Failed to retrieve data from database', dbError as Error);
      }
      
    } else if (req.method === 'POST') {
      // Phase 2-1: POST /api/data 完全実装（バリデーション強化）
      
      // リクエスト検証
      const validation = validateApiDataRequest(req.body);
      if (!validation.valid) {
        return res.status(400).json({
          success: false,
          timestamp: new Date().toISOString(),
          error: {
            code: validation.errorCode || API_ERROR_CODES.VALIDATION_ERROR,
            message: validation.error || '無効なリクエストデータです'
          }
        });
      }

      const requestData = req.body as ApiDataRequest;
      
      try {
        let updatedBudget: BudgetType | null = null;
        let updatedSettings: SettingsType | null = null;
        const updatedHoldings: HoldingType[] = [];

        // データ更新処理（トランザクション的に処理）
        const updatePromises = [];

        // 予算更新
        if (requestData.budget) {
          updatePromises.push(
            dbService.upsertBudget(requestData.budget).then(result => {
              updatedBudget = result;
            })
          );
        }

        // 設定・フォーメーション更新
        if (requestData.settings || requestData.formationId) {
          const settingsUpdate: Partial<SettingsType> = {
            ...requestData.settings
          };
          
          if (requestData.formationId) {
            settingsUpdate.currentFormationId = requestData.formationId;
            settingsUpdate.lastCheckDate = new Date().toISOString();
          }
          
          updatePromises.push(
            dbService.upsertSettings(settingsUpdate).then(result => {
              updatedSettings = result;
            })
          );

          // フォーメーション使用統計を並行更新
          if (requestData.formationId) {
            updatePromises.push(
              dbService.upsertFormationUsage(requestData.formationId)
            );
          }
        }

        // 基本更新を並行実行
        await Promise.all(updatePromises);

        // 保有銘柄更新（フルリプレース）
        if (requestData.holdings && Array.isArray(requestData.holdings) && requestData.holdings.length > 0) {
          await dbService.clearAllHoldings();
          
          const holdingPromises = requestData.holdings.map(holding => 
            dbService.upsertHolding(holding)
          );
          
          const results = await Promise.all(holdingPromises);
          updatedHoldings.push(...results);
        }

        // 最終データ取得
        const finalData = await dbService.getAllData();

        const response: ApiDataResponse = {
          success: true,
          timestamp: new Date().toISOString(),
          data: {
            budget: updatedBudget || finalData.budget || {
              id: `default-budget-${Date.now()}`,
              funds: 6000,
              start: 6000,
              profit: 0,
              updatedAt: new Date().toISOString()
            },
            holdings: updatedHoldings.length > 0 ? updatedHoldings : finalData.holdings || [],
            settings: updatedSettings || finalData.settings || {
              id: `default-settings-${Date.now()}`,
              currentFormationId: 'formation-3-50-30-20',
              lastCheckDate: new Date().toISOString(),
              autoCheckEnabled: true,
              createdAt: new Date().toISOString(),
              updatedAt: new Date().toISOString()
            },
            formations: FORMATIONS,
            usageStats: finalData.usageStats || []
          }
        };

        const processingTime = Date.now() - startTime;
        console.log(`[${requestId}] POST /api/data completed in ${processingTime}ms`);
        
        // パフォーマンスメトリクスをレスポンスヘッダーに追加
        if (process.env.NODE_ENV === 'development') {
          res.setHeader('X-Response-Time', `${processingTime}ms`);
          res.setHeader('X-Data-Size', JSON.stringify(response).length.toString());
          res.setHeader('X-DB-Operations', updatedHoldings.length.toString());
        }
        
        res.status(200).json(response);

      } catch (dbError) {
        throw new DatabaseError('Failed to save data to database', dbError as Error);
      }
      
    } else {
      // サポートされていないHTTPメソッド
      res.status(405).json({
        success: false,
        timestamp: new Date().toISOString(),
        error: {
          code: API_ERROR_CODES.METHOD_NOT_ALLOWED,
          message: `HTTPメソッド ${req.method} はこのエンドポイントで許可されていません`
        }
      });
    }
    
  } catch (error) {
    // Phase 2-1: 強化されたエラーハンドリング
    console.error(`[${requestId}] API Error:`, error);
    
    let errorCode: ApiErrorCode = API_ERROR_CODES.INTERNAL_ERROR;
    let errorMessage = '内部サーバーエラーが発生しました';
    let statusCode = 500;

    if (error instanceof DatabaseError) {
      errorCode = API_ERROR_CODES.DATABASE_ERROR;
      errorMessage = 'データベース操作に失敗しました';
    }

    // 開発環境では詳細なエラー情報を提供
    if (process.env.NODE_ENV === 'development') {
      errorMessage = `開発環境エラー: ${error instanceof Error ? error.message : '不明なエラー'}`;
    }
    
    res.status(statusCode).json({
      success: false,
      timestamp: new Date().toISOString(),
      error: {
        code: errorCode,
        message: errorMessage,
        ...(process.env.NODE_ENV === 'development' && {
          details: {
            requestId,
            processingTime: `${Date.now() - startTime}ms`,
            stack: error instanceof Error ? error.stack : undefined
          }
        })
      }
    });
  }
}

// Phase 2-1: Cloudflare Pages Functions 完全統合
// Drizzle ORM DatabaseService を完全統合した Cloudflare Pages Functions

export async function onRequestGet(context: any) {
  const { request, env } = context;
  
  try {
    // Cloudflare環境をグローバルに設定（DatabaseService統合）
    (global as any).__env__ = env;
    
    const url = new URL(request.url);
    const mockReq = {
      method: 'GET',
      url: url.pathname,
      query: Object.fromEntries(url.searchParams),
      headers: {
        'x-request-id': `cf-get-${Date.now()}`
      },
      body: null
    } as Partial<NextApiRequest> & { method: string; };

    let responseData: ApiDataResponse;
    let statusCode = 200;

    const mockRes = {
      status: (code: number) => ({
        json: (data: ApiDataResponse) => {
          responseData = data;
          statusCode = code;
          return new Response(JSON.stringify(data), {
            status: code,
            headers: { 
              'Content-Type': 'application/json',
              'Access-Control-Allow-Origin': '*',
              'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
              'Access-Control-Allow-Headers': 'Content-Type, x-request-id'
            }
          });
        }
      })
    } as any;

    await handler(mockReq as any, mockRes);
    
    return new Response(JSON.stringify(responseData!), {
      status: statusCode,
      headers: { 
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      }
    });

  } catch (error) {
    console.error('Cloudflare GET handler error:', error);
    return new Response(JSON.stringify({
      success: false,
      timestamp: new Date().toISOString(),
      error: {
        code: API_ERROR_CODES.INTERNAL_ERROR,
        message: 'Cloudflare function execution failed'
      }
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}

export async function onRequestPost(context: any) {
  const { request, env } = context;
  
  try {
    // Cloudflare環境をグローバルに設定（DatabaseService統合）
    (global as any).__env__ = env;
    
    let body;
    try {
      body = await request.json();
    } catch (parseError) {
      return new Response(JSON.stringify({
        success: false,
        timestamp: new Date().toISOString(),
        error: {
          code: API_ERROR_CODES.VALIDATION_ERROR,
          message: 'Invalid JSON in request body'
        }
      }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }
    
    const url = new URL(request.url);
    const mockReq = {
      method: 'POST',
      url: url.pathname,
      query: Object.fromEntries(url.searchParams),
      headers: {
        'x-request-id': `cf-post-${Date.now()}`
      },
      body
    } as Partial<NextApiRequest> & { method: string; body: any; };

    let responseData: ApiDataResponse;
    let statusCode = 200;

    const mockRes = {
      status: (code: number) => ({
        json: (data: ApiDataResponse) => {
          responseData = data;
          statusCode = code;
          return new Response(JSON.stringify(data), {
            status: code,
            headers: { 
              'Content-Type': 'application/json',
              'Access-Control-Allow-Origin': '*',
              'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
              'Access-Control-Allow-Headers': 'Content-Type, x-request-id'
            }
          });
        }
      })
    } as any;

    await handler(mockReq as any, mockRes);
    
    return new Response(JSON.stringify(responseData!), {
      status: statusCode,
      headers: { 
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      }
    });

  } catch (error) {
    console.error('Cloudflare POST handler error:', error);
    return new Response(JSON.stringify({
      success: false,
      timestamp: new Date().toISOString(),
      error: {
        code: API_ERROR_CODES.INTERNAL_ERROR,
        message: 'Cloudflare function execution failed'
      }
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}

// CORS対応のOPTIONSハンドラー
export async function onRequestOptions() {
  return new Response(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, x-request-id',
      'Access-Control-Max-Age': '86400'
    }
  });
}