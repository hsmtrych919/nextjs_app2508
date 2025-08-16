// Cloudflare Functions版 - データAPI
// Agent 2 Phase 2-1: Cloudflare Functions 専用実装

import { createDatabaseService, handleDatabaseError, DatabaseError } from '../../src/lib/utils/database';
import { FORMATION_DEFINITIONS } from '../../src/lib/constants/types';
import { API_ERROR_CODES, TICKER_SYMBOLS } from '../../src/lib/utils/types';

// Cloudflare Functions での GET リクエスト
export async function onRequestGet(context) {
  const { request, env } = context;

  try {
    const dbService = createDatabaseService(env);
    const data = await dbService.getAllData();

    const response = {
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
        formations: FORMATION_DEFINITIONS.map(f => ({
          id: f.id,
          name: f.name,
          tiers: f.tiers,
          targetPercentages: f.percentages,
          description: f.name
        })),
        usageStats: data.usageStats || []
      }
    };

    return new Response(JSON.stringify(response), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      }
    });

  } catch (error) {
    console.error('GET /api/data error:', error);
    return new Response(JSON.stringify({
      success: false,
      timestamp: new Date().toISOString(),
      error: {
        code: API_ERROR_CODES.INTERNAL_ERROR,
        message: 'データ取得に失敗しました'
      }
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}

// Cloudflare Functions での POST リクエスト
export async function onRequestPost(context) {
  const { request, env } = context;

  try {
    const body = await request.json();
    const dbService = createDatabaseService(env);

    // データ更新処理
    if (body.budget) {
      await dbService.upsertBudget(body.budget);
    }

    if (body.settings || body.formationId) {
      const settingsUpdate = { ...body.settings };
      if (body.formationId) {
        settingsUpdate.currentFormationId = body.formationId;
        settingsUpdate.lastCheckDate = new Date().toISOString();
      }
      await dbService.upsertSettings(settingsUpdate);
    }

    if (body.holdings && Array.isArray(body.holdings)) {
      await dbService.clearAllHoldings();
      for (const holding of body.holdings) {
        await dbService.upsertHolding(holding);
      }
    }

    // 更新後データ取得
    const data = await dbService.getAllData();

    const response = {
      success: true,
      timestamp: new Date().toISOString(),
      data: {
        budget: data.budget,
        holdings: data.holdings || [],
        settings: data.settings,
        formations: FORMATION_DEFINITIONS.map(f => ({
          id: f.id,
          name: f.name,
          tiers: f.tiers,
          targetPercentages: f.percentages,
          description: f.name
        })),
        usageStats: data.usageStats || []
      }
    };

    return new Response(JSON.stringify(response), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      }
    });

  } catch (error) {
    console.error('POST /api/data error:', error);
    return new Response(JSON.stringify({
      success: false,
      timestamp: new Date().toISOString(),
      error: {
        code: API_ERROR_CODES.INTERNAL_ERROR,
        message: 'データ保存に失敗しました'
      }
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}

// CORS対応
export async function onRequestOptions() {
  return new Response(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type'
    }
  });
}
