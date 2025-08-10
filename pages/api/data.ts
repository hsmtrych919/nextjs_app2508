// サテライト投資管理アプリ - メインデータAPI
import type { NextApiRequest, NextApiResponse } from 'next';
import { createDatabaseService, handleDatabaseError } from '../../src/lib/utils/database';
import { FORMATIONS } from '../../src/lib/utils/types';
import type { 
  ApiDataRequest, 
  ApiDataResponse, 
  CloudflareEnv,
  HoldingType,
  BudgetType,
  SettingsType 
} from '../../src/lib/utils/types';

// 開発環境用のメモリ内データストレージ
const developmentStorage = {
  settings: null as SettingsType | null,
  budget: null as BudgetType | null,
  holdings: [] as HoldingType[],
  usageStats: [] as any[]
};

// Cloudflare環境変数の型アサーション
function getCloudflareEnv(): CloudflareEnv | null {
  if (process.env.NODE_ENV === 'development') {
    // 開発環境では null を返し、メモリストレージを使用
    return null;
  }
  
  // 本番環境では Request の env プロパティから取得
  return (global as any).__env__ as CloudflareEnv;
}

// 開発環境用のモックデータベースサービス
class MockDatabaseService {
  async getAllData() {
    return {
      settings: developmentStorage.settings,
      budget: developmentStorage.budget,
      holdings: developmentStorage.holdings,
      usageStats: developmentStorage.usageStats
    };
  }

  async upsertBudget(budgetData: Partial<BudgetType>): Promise<BudgetType> {
    const updated = {
      id: 'dev-budget',
      funds: budgetData.funds || 6000,
      start: budgetData.start || 6000,
      profit: budgetData.profit || 0,
      updatedAt: new Date().toISOString(),
      ...budgetData
    };
    developmentStorage.budget = updated;
    return updated;
  }

  async upsertSettings(settingsData: Partial<SettingsType>): Promise<SettingsType> {
    const updated = {
      id: 'dev-settings',
      currentFormationId: 'formation-3-50-30-20',
      lastCheckDate: new Date().toISOString(),
      autoCheckEnabled: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      ...developmentStorage.settings,
      ...settingsData
    };
    developmentStorage.settings = updated;
    return updated;
  }

  async clearAllHoldings(): Promise<void> {
    developmentStorage.holdings = [];
  }

  async upsertHolding(holding: HoldingType): Promise<HoldingType> {
    const existingIndex = developmentStorage.holdings.findIndex(h => h.id === holding.id);
    if (existingIndex >= 0) {
      developmentStorage.holdings[existingIndex] = holding;
    } else {
      developmentStorage.holdings.push(holding);
    }
    return holding;
  }

  async upsertFormationUsage(formationId: string) {
    // 開発環境では簡単な実装
    return {
      id: `dev-usage-${formationId}`,
      formationId,
      usageCount: 1,
      totalDays: 1,
      usagePercentage: 100,
      lastUsedDate: new Date().toISOString(),
      createdAt: new Date().toISOString()
    };
  }
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<ApiDataResponse>
) {
  try {
    const env = getCloudflareEnv();
    const dbService = env ? createDatabaseService(env) : new MockDatabaseService();

    if (req.method === 'GET') {
      // 全データ取得
      const data = await dbService.getAllData();
      
      const response: ApiDataResponse = {
        success: true,
        data: {
          budget: data.budget || {
            id: 'default-budget',
            funds: 6000,
            start: 6000,
            profit: 0,
            updatedAt: new Date().toISOString()
          },
          holdings: data.holdings || [],
          settings: data.settings || {
            id: 'default-settings',
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

      res.status(200).json(response);
      
    } else if (req.method === 'POST') {
      // データ保存 - 入力検証
      if (!req.body || typeof req.body !== 'object') {
        return res.status(400).json({
          success: false,
          error: 'Invalid request body. Expected JSON object.'
        });
      }

      const requestData = req.body as ApiDataRequest;
      
      let updatedBudget: BudgetType | null = null;
      let updatedSettings: SettingsType | null = null;
      const updatedHoldings: HoldingType[] = [];

      // 予算更新
      if (requestData.budget) {
        updatedBudget = await dbService.upsertBudget(requestData.budget);
      }

      // 設定更新
      if (requestData.settings || requestData.formationId) {
        const settingsUpdate: Partial<SettingsType> = {
          ...requestData.settings
        };
        
        if (requestData.formationId) {
          settingsUpdate.currentFormationId = requestData.formationId;
          // フォーメーション使用統計を更新
          await dbService.upsertFormationUsage(requestData.formationId);
        }
        
        updatedSettings = await dbService.upsertSettings(settingsUpdate);
      }

      // 保有銘柄更新
      if (requestData.holdings && requestData.holdings.length > 0) {
        // 全ての保有銘柄を更新（フルリプレース）
        await dbService.clearAllHoldings();
        
        for (const holding of requestData.holdings) {
          const updated = await dbService.upsertHolding(holding);
          updatedHoldings.push(updated);
        }
      }

      // 更新後のデータを取得
      const data = await dbService.getAllData();

      const response: ApiDataResponse = {
        success: true,
        data: {
          budget: updatedBudget || data.budget || {
            id: 'default-budget',
            funds: 6000,
            start: 6000,
            profit: 0,
            updatedAt: new Date().toISOString()
          },
          holdings: updatedHoldings.length > 0 ? updatedHoldings : data.holdings || [],
          settings: updatedSettings || data.settings || {
            id: 'default-settings',
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

      res.status(200).json(response);
      
    } else {
      // サポートされていないメソッド
      res.status(405).json({
        success: false,
        error: `Method ${req.method} Not Allowed`
      });
    }
    
  } catch (error) {
    console.error('API Error:', error);
    
    // 開発環境では詳細なエラー情報を返す
    if (process.env.NODE_ENV === 'development') {
      return res.status(500).json({
        success: false,
        error: `Development error: ${error instanceof Error ? error.message : 'Unknown error occurred'}`
      } as ApiDataResponse);
    }
    
    // 本番環境では安全なエラーメッセージのみ
    const envVar = getCloudflareEnv();
    const dbError = envVar ? handleDatabaseError(error) : new Error('Development mode error');
    
    res.status(500).json({
      success: false,
      error: 'Internal server error occurred'
    });
  }
}

// Cloudflare Pages Functions用のエクスポート
// この関数は Cloudflare Pages で自動的に呼ばれる
export async function onRequestGet(context: any) {
  const { request, env } = context;
  
  // Cloudflare 環境を global に設定
  (global as any).__env__ = env;
  
  const url = new URL(request.url);
  const mockReq = {
    method: 'GET',
    url: url.pathname,
    query: Object.fromEntries(url.searchParams),
    body: null
  } as any;

  const mockRes = {
    status: (code: number) => ({
      json: (data: any) => new Response(JSON.stringify(data), {
        status: code,
        headers: { 'Content-Type': 'application/json' }
      })
    })
  } as any;

  await handler(mockReq, mockRes);
}

export async function onRequestPost(context: any) {
  const { request, env } = context;
  
  // Cloudflare 環境を global に設定
  (global as any).__env__ = env;
  
  const body = await request.json();
  const url = new URL(request.url);
  
  const mockReq = {
    method: 'POST',
    url: url.pathname,
    query: Object.fromEntries(url.searchParams),
    body
  } as any;

  const mockRes = {
    status: (code: number) => ({
      json: (data: any) => new Response(JSON.stringify(data), {
        status: code,
        headers: { 'Content-Type': 'application/json' }
      })
    })
  } as any;

  await handler(mockReq, mockRes);
}