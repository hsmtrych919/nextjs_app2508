// サテライト投資管理アプリ - 自動チェック（Cron）API
import type { NextApiRequest, NextApiResponse } from 'next';
import { createDatabaseService, handleDatabaseError } from '../../src/lib/utils/database';
import { FORMATIONS } from '../../src/lib/utils/types';
import type { 
  ApiCronResponse, 
  CloudflareEnv,
  FormationUsageType 
} from '../../src/lib/utils/types';

// 開発環境用のメモリ内ストレージ（data.tsと同じデータを共有）
const developmentCronStorage = {
  lastCheckDate: new Date().toISOString(),
  currentFormationId: 'formation-3-50-30-20'
};

// Cloudflare環境変数の取得
function getCloudflareEnv(): CloudflareEnv | null {
  if (process.env.NODE_ENV === 'development') {
    return null; // 開発環境では null を返す
  }
  
  return (global as any).__env__ as CloudflareEnv;
}

// 開発環境用のモックサービス
class MockCronService {
  async getSettings() {
    return {
      id: 'dev-settings',
      currentFormationId: developmentCronStorage.currentFormationId,
      lastCheckDate: developmentCronStorage.lastCheckDate,
      autoCheckEnabled: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
  }

  async upsertSettings(data: any) {
    developmentCronStorage.lastCheckDate = data.lastCheckDate || developmentCronStorage.lastCheckDate;
    return this.getSettings();
  }

  async upsertFormationUsage(formationId: string) {
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

  async getFormationUsage() {
    return [];
  }
}

// フォーメーション変更を検知する関数
async function checkFormationChange(dbService: any): Promise<{
  hasChanged: boolean;
  currentFormationId: string;
  lastCheckDate: string;
}> {
  const settings = await dbService.getSettings();
  
  if (!settings) {
    // 初回実行時は変更なしとして扱う
    return {
      hasChanged: false,
      currentFormationId: 'formation-3-50-30-20',
      lastCheckDate: new Date().toISOString()
    };
  }

  const now = new Date();
  const lastCheck = new Date(settings.lastCheckDate);
  const daysSinceLastCheck = Math.floor((now.getTime() - lastCheck.getTime()) / (1000 * 60 * 60 * 24));

  // 前日から変更があったかどうか（簡単な実装）
  // 実際のプロダクションでは、より精密な変更検知が必要
  const hasChanged = daysSinceLastCheck >= 1;

  return {
    hasChanged,
    currentFormationId: settings.currentFormationId,
    lastCheckDate: settings.lastCheckDate
  };
}

// フォーメーション使用統計を更新する関数
async function updateFormationUsageStats(
  dbService: any, 
  currentFormationId: string
): Promise<FormationUsageType[]> {
  try {
    // 現在のフォーメーションの使用統計を更新
    const updatedUsage = await dbService.upsertFormationUsage(currentFormationId);
    
    // 他のフォーメーションの総日数も増加させる
    const allUsageStats = await dbService.getFormationUsage();
    const updatedStats: FormationUsageType[] = [];

    for (const stat of allUsageStats) {
      if (stat.formationId !== currentFormationId) {
        // 現在のフォーメーション以外は総日数のみ増加
        const updated = {
          ...stat,
          totalDays: stat.totalDays + 1,
          usagePercentage: (stat.usageCount / (stat.totalDays + 1)) * 100
        };
        
        // データベースを更新（簡略実装）
        updatedStats.push(updated);
      } else {
        updatedStats.push(updatedUsage);
      }
    }

    return updatedStats;
  } catch (error) {
    console.error('Error updating formation usage stats:', error);
    return [];
  }
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<ApiCronResponse>
) {
  try {
    // POSTメソッドのみ許可
    if (req.method !== 'POST') {
      return res.status(405).json({
        success: false,
        message: `Method ${req.method} Not Allowed`
      });
    }

    const env = getCloudflareEnv();
    const dbService = env ? createDatabaseService(env) : new MockCronService();

    // フォーメーション変更を検知
    const changeCheck = await checkFormationChange(dbService);

    if (!changeCheck.hasChanged) {
      return res.status(200).json({
        success: true,
        message: 'No changes detected since last check',
        changesDetected: false
      });
    }

    // フォーメーション使用統計を更新
    const updatedStats = await updateFormationUsageStats(
      dbService, 
      changeCheck.currentFormationId
    );

    // 最終チェック日時を更新
    await dbService.upsertSettings({
      lastCheckDate: new Date().toISOString()
    });

    res.status(200).json({
      success: true,
      message: `Formation usage statistics updated for ${changeCheck.currentFormationId}`,
      changesDetected: true,
      updatedUsage: updatedStats
    });

  } catch (error) {
    console.error('Cron API Error:', error);
    
    // 開発環境では詳細なエラー情報を返す
    if (process.env.NODE_ENV === 'development') {
      return res.status(500).json({
        success: false,
        message: `Development error: ${error instanceof Error ? error.message : 'Unknown error'}`
      });
    }
    
    // 本番環境では安全なエラーメッセージ
    const envVar = getCloudflareEnv();
    const dbError = envVar ? handleDatabaseError(error) : new Error('Development error');
    
    res.status(500).json({
      success: false,
      message: 'Cron job execution failed'
    });
  }
}

// Cloudflare Workers Cron Trigger用
// wrangler.toml で設定される cron トリガーから呼び出される
export async function scheduled(event: any, env: CloudflareEnv, ctx: any) {
  console.log('Cron trigger executed at:', new Date().toISOString());
  
  try {
    // Cloudflare 環境を global に設定
    (global as any).__env__ = env;
    
    const dbService = createDatabaseService(env);
    
    // 自動チェック処理を実行
    const changeCheck = await checkFormationChange(dbService);
    
    if (changeCheck.hasChanged) {
      await updateFormationUsageStats(dbService, changeCheck.currentFormationId);
      await dbService.upsertSettings({
        lastCheckDate: new Date().toISOString()
      });
      
      console.log(`Formation usage updated for: ${changeCheck.currentFormationId}`);
    } else {
      console.log('No formation changes detected');
    }
    
    return new Response('Cron job completed successfully', { status: 200 });
    
  } catch (error) {
    console.error('Scheduled cron job error:', error);
    return new Response(`Cron job failed: ${error}`, { status: 500 });
  }
}

// Cloudflare Pages Functions用のエクスポート
export async function onRequestPost(context: any) {
  const { request, env } = context;
  
  // Cloudflare 環境を global に設定
  (global as any).__env__ = env;
  
  const url = new URL(request.url);
  
  const mockReq = {
    method: 'POST',
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

// デバッグ用：手動でcronジョブを実行するための関数
export function createManualCronTrigger() {
  return {
    async trigger(env: CloudflareEnv) {
      const mockEvent = {
        scheduledTime: Date.now(),
        cron: '0 5 * * *' // 毎日AM5:00
      };
      
      const mockCtx = {
        waitUntil: (promise: Promise<any>) => promise
      };
      
      return scheduled(mockEvent, env, mockCtx);
    }
  };
}