// サテライト投資管理アプリ - APIクライアント
// Agent 1 Phase 3-1: フロントエンド・バックエンド統合

import type { 
  ApiDataRequest, 
  ApiDataResponse, 
  BudgetType, 
  HoldingType, 
  SettingsType, 
  FormationType,
  FormationUsageType,
  API_ERROR_CODES 
} from './types';

// API設定
const API_BASE_URL = process.env.NODE_ENV === 'development' 
  ? 'http://localhost:3000' 
  : '';

const API_ENDPOINTS = {
  DATA: '/api/data',
  CRON: '/api/cron'
} as const;

// APIエラークラス
export class ApiError extends Error {
  constructor(
    public code: string,
    message: string,
    public statusCode?: number,
    public details?: unknown
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

// API共通設定
const createRequestConfig = (method: 'GET' | 'POST', body?: unknown): RequestInit => {
  const config: RequestInit = {
    method,
    headers: {
      'Content-Type': 'application/json',
      'x-request-id': `client-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
    }
  };
  
  if (body) {
    config.body = JSON.stringify(body);
  }
  
  return config;
};

// レスポンス処理ユーティリティ
const handleApiResponse = async <T>(response: Response): Promise<T> => {
  if (!response.ok) {
    let errorData: any;
    try {
      errorData = await response.json();
    } catch {
      throw new ApiError(
        'NETWORK_ERROR',
        `HTTP ${response.status}: ${response.statusText}`,
        response.status
      );
    }

    throw new ApiError(
      errorData.error?.code || 'UNKNOWN_ERROR',
      errorData.error?.message || 'APIエラーが発生しました',
      response.status,
      errorData.error?.details
    );
  }

  try {
    const data = await response.json();
    if (!data.success) {
      throw new ApiError(
        data.error?.code || 'API_ERROR',
        data.error?.message || 'API処理に失敗しました',
        response.status,
        data.error?.details
      );
    }
    return data as T;
  } catch (error) {
    if (error instanceof ApiError) {
      throw error;
    }
    throw new ApiError(
      'PARSE_ERROR',
      'APIレスポンスの解析に失敗しました',
      response.status
    );
  }
};

// データ取得API
export const fetchAllData = async (): Promise<{
  budget: BudgetType;
  holdings: HoldingType[];
  settings: SettingsType;
  formations: FormationType[];
  usageStats: FormationUsageType[];
}> => {
  try {
    const response = await fetch(`${API_BASE_URL}${API_ENDPOINTS.DATA}`, createRequestConfig('GET'));
    const apiResponse = await handleApiResponse<ApiDataResponse>(response);
    
    if (!apiResponse.success || !apiResponse.data) {
      throw new ApiError('NO_DATA', 'APIからデータを取得できませんでした');
    }

    return apiResponse.data;
  } catch (error) {
    if (error instanceof ApiError) {
      throw error;
    }
    throw new ApiError(
      'FETCH_ERROR',
      'データ取得中にエラーが発生しました',
      undefined,
      error
    );
  }
};

// データ保存API
export const saveAllData = async (data: {
  budget?: Partial<BudgetType>;
  holdings?: HoldingType[];
  settings?: Partial<SettingsType>;
  formationId?: string;
}): Promise<{
  budget: BudgetType;
  holdings: HoldingType[];
  settings: SettingsType;
  formations: FormationType[];
  usageStats: FormationUsageType[];
}> => {
  try {
    const requestData: ApiDataRequest = {
      ...data,
      requestId: `save-${Date.now()}`
    };

    const response = await fetch(
      `${API_BASE_URL}${API_ENDPOINTS.DATA}`, 
      createRequestConfig('POST', requestData)
    );
    
    const apiResponse = await handleApiResponse<ApiDataResponse>(response);
    
    if (!apiResponse.success || !apiResponse.data) {
      throw new ApiError('NO_DATA', 'データ保存後の応答データがありません');
    }

    return apiResponse.data;
  } catch (error) {
    if (error instanceof ApiError) {
      throw error;
    }
    throw new ApiError(
      'SAVE_ERROR',
      'データ保存中にエラーが発生しました',
      undefined,
      error
    );
  }
};

// 予算のみ保存
export const saveBudget = async (budget: Partial<BudgetType>): Promise<BudgetType> => {
  try {
    const result = await saveAllData({ budget });
    return result.budget;
  } catch (error) {
    if (error instanceof ApiError) {
      throw error;
    }
    throw new ApiError(
      'BUDGET_SAVE_ERROR',
      '予算データの保存中にエラーが発生しました',
      undefined,
      error
    );
  }
};

// 保有銘柄のみ保存
export const saveHoldings = async (holdings: HoldingType[]): Promise<HoldingType[]> => {
  try {
    const result = await saveAllData({ holdings });
    return result.holdings;
  } catch (error) {
    if (error instanceof ApiError) {
      throw error;
    }
    throw new ApiError(
      'HOLDINGS_SAVE_ERROR',
      '保有銘柄データの保存中にエラーが発生しました',
      undefined,
      error
    );
  }
};

// フォーメーション設定保存
export const saveFormation = async (formationId: string, settings?: Partial<SettingsType>): Promise<{
  settings: SettingsType;
  usageStats: FormationUsageType[];
}> => {
  try {
    const result = await saveAllData({ formationId, settings });
    return {
      settings: result.settings,
      usageStats: result.usageStats
    };
  } catch (error) {
    if (error instanceof ApiError) {
      throw error;
    }
    throw new ApiError(
      'FORMATION_SAVE_ERROR',
      'フォーメーションデータの保存中にエラーが発生しました',
      undefined,
      error
    );
  }
};

// エラーハンドリング用ユーティリティ
export const isApiError = (error: unknown): error is ApiError => {
  return error instanceof ApiError;
};

export const getErrorMessage = (error: unknown): string => {
  if (isApiError(error)) {
    return error.message;
  }
  if (error instanceof Error) {
    return error.message;
  }
  return '予期しないエラーが発生しました';
};

export const getErrorCode = (error: unknown): string => {
  if (isApiError(error)) {
    return error.code;
  }
  return 'UNKNOWN_ERROR';
};

// 開発環境用デバッグユーティリティ
export const logApiCall = (endpoint: string, method: string, data?: unknown) => {
  if (process.env.NODE_ENV === 'development') {
    console.log(`[API] ${method} ${endpoint}`, data);
  }
};

export const logApiError = (error: unknown, context?: string) => {
  if (process.env.NODE_ENV === 'development') {
    console.error(`[API Error]${context ? ` ${context}` : ''}:`, error);
  }
};

// 型ガード関数
export const isValidApiDataResponse = (data: unknown): data is ApiDataResponse => {
  return (
    typeof data === 'object' &&
    data !== null &&
    'success' in data &&
    'timestamp' in data
  );
};

export const hasApiResponseData = (response: any): response is { success: true; data: any } => {
  return response.success && !!response.data;
};

// リトライ機能付きAPI呼び出し
export const apiCallWithRetry = async <T>(
  apiCall: () => Promise<T>,
  maxRetries = 3,
  delay = 1000
): Promise<T> => {
  let lastError: unknown;
  
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      return await apiCall();
    } catch (error) {
      lastError = error;
      
      // 最後の試行でない場合は待機
      if (attempt < maxRetries) {
        await new Promise(resolve => setTimeout(resolve, delay * attempt));
      }
      
      // 特定のエラーはリトライしない
      if (isApiError(error) && ['VALIDATION_ERROR', 'NOT_FOUND'].includes(error.code)) {
        throw error;
      }
    }
  }
  
  throw lastError;
};

// ネットワーク状態チェック
export const checkApiHealth = async (): Promise<boolean> => {
  try {
    const response = await fetch(`${API_BASE_URL}${API_ENDPOINTS.DATA}`, {
      method: 'GET',
      headers: { 'x-health-check': 'true' }
    });
    return response.ok;
  } catch {
    return false;
  }
};