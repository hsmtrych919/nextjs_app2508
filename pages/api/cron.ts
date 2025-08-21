// サテライト投資管理アプリ - 自動チェック（Cron）API
import type { NextApiRequest, NextApiResponse } from 'next';
import { createDatabaseService, handleDatabaseError } from '../../src/lib/utils/database';
import { sendErrorResponse } from '../../src/lib/utils/api-error-handler';
import { FORMATION_DEFINITIONS } from '../../src/lib/constants/types';
import { API_ERROR_CODES } from '../../src/lib/utils/types';
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

// フォーメーション変更を検知する関数（DatabaseServiceの新メソッドを使用）
async function checkFormationChange(dbService: any): Promise<{
  hasChanged: boolean;
  currentFormationId: string;
  lastCheckDate: string;
  previousFormation?: string | null;
}> {
  // MockCronServiceの場合は既存のロジックを使用
  if (dbService instanceof MockCronService) {
    const settings = await dbService.getSettings();

    if (!settings) {
      return {
        hasChanged: false,
        currentFormationId: 'formation-3-50-30-20',
        lastCheckDate: new Date().toISOString()
      };
    }

    const now = new Date();
    const lastCheck = new Date(settings.lastCheckDate);
    const daysSinceLastCheck = Math.floor((now.getTime() - lastCheck.getTime()) / (1000 * 60 * 60 * 24));

    return {
      hasChanged: daysSinceLastCheck >= 1,
      currentFormationId: settings.currentFormationId,
      lastCheckDate: settings.lastCheckDate
    };
  }

  // 本番環境：DatabaseServiceの新しいメソッドを使用
  try {
    const changeResult = await dbService.checkFormationChangeAndUpdate();
    return {
      hasChanged: changeResult.hasChanged,
      currentFormationId: changeResult.currentFormation,
      lastCheckDate: new Date().toISOString(),
      previousFormation: changeResult.previousFormation
    };
  } catch (error) {
    console.error('Error in formation change detection:', error);
    // フォールバック：設定から情報を取得
    const settings = await dbService.getSettings();
    if (!settings) {
      throw error;
    }

    return {
      hasChanged: false,
      currentFormationId: settings.currentFormationId,
      lastCheckDate: settings.lastCheckDate
    };
  }
}

// フォーメーション使用統計を更新する関数
async function updateFormationUsageStats(
  dbService: any,
  currentFormationId: string,
  hasChanged: boolean
): Promise<FormationUsageType[]> {
  try {
    // MockCronService用の従来ロジック
    if (dbService instanceof MockCronService) {
      const updatedUsage = await dbService.upsertFormationUsage(currentFormationId);
      return [updatedUsage];
    }

    // DatabaseServiceの場合：checkFormationChangeAndUpdateで既に更新済み
    if (!hasChanged) {
      return await dbService.getFormationUsage();
    }

    // 本番環境：変更検知と更新が既に完了しているため、最新の統計を取得
    return await dbService.getFormationUsage();
  } catch (error) {
    console.error('Error updating formation usage stats:', error);
    return [];
  }
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<ApiCronResponse>
) {
  const startTime = Date.now();
  const requestId = req.headers['x-request-id'] as string || `cron-${Date.now()}`;

  try {
    // POSTメソッドのみ許可
    if (req.method !== 'POST') {
      return res.status(405).json({
        success: false,
        timestamp: new Date().toISOString(),
        error: {
          code: API_ERROR_CODES.METHOD_NOT_ALLOWED,
          message: `HTTPメソッド ${req.method} は許可されていません`
        }
      });
    }

    const env = getCloudflareEnv();
    const dbService = env ? createDatabaseService(env) : new MockCronService();

    // フォーメーション変更を検知
    const changeCheck = await checkFormationChange(dbService);

    if (!changeCheck.hasChanged) {
      console.log(`[${requestId}] No changes detected in ${Date.now() - startTime}ms`);
      return res.status(200).json({
        success: true,
        timestamp: new Date().toISOString(),
        data: {
          message: '前回のチェック以降、変更は検出されませんでした',
          changesDetected: false,
          processedFormations: []
        }
      });
    }

    // フォーメーション使用統計を更新
    const updatedStats = await updateFormationUsageStats(
      dbService,
      changeCheck.currentFormationId,
      changeCheck.hasChanged
    );

    // 最終チェック日時を更新
    await dbService.upsertSettings({
      lastCheckDate: new Date().toISOString()
    });

    console.log(`[${requestId}] Cron job completed in ${Date.now() - startTime}ms`);
    res.status(200).json({
      success: true,
      timestamp: new Date().toISOString(),
      data: {
        message: `フォーメーション使用統計を更新しました: ${changeCheck.currentFormationId}`,
        changesDetected: true,
        processedFormations: [changeCheck.currentFormationId],
        updatedUsage: updatedStats
      }
    });

  } catch (error) {
    // 統一されたエラーハンドリング関数を使用
    sendErrorResponse(res, error, {
      requestId,
      processingTime: Date.now() - startTime
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
      await updateFormationUsageStats(dbService, changeCheck.currentFormationId, changeCheck.hasChanged);

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