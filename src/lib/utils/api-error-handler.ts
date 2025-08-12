import { NextApiResponse } from 'next';
import { DatabaseError } from './database';
import { ApiErrorResponse, API_ERROR_CODES, ApiErrorCode } from './types';

export interface ErrorHandlingOptions {
  requestId?: string;
  processingTime?: number;
  includeDetails?: boolean;
}

/**
 * 統一されたAPIエラー応答を生成する共通関数
 */
export function createErrorResponse(
  error: unknown,
  options: ErrorHandlingOptions = {}
): ApiErrorResponse {
  const { requestId, processingTime, includeDetails = process.env.NODE_ENV === 'development' } = options;

  let errorCode: ApiErrorCode = API_ERROR_CODES.INTERNAL_ERROR;
  let errorMessage = '内部サーバーエラーが発生しました';
  let statusCode = 500;

  // エラーの種類に応じた分類
  if (error instanceof DatabaseError) {
    switch (error.errorType) {
      case 'CONNECTION':
        errorCode = API_ERROR_CODES.DATABASE_CONNECTION_ERROR;
        errorMessage = 'データベースへの接続に失敗しました';
        break;
      case 'TIMEOUT':
        errorCode = API_ERROR_CODES.DATABASE_TIMEOUT_ERROR;
        errorMessage = 'データベース接続がタイムアウトしました';
        break;
      case 'AUTHENTICATION':
        errorCode = API_ERROR_CODES.DATABASE_AUTH_ERROR;
        errorMessage = 'データベース認証に失敗しました';
        break;
      case 'QUERY':
        errorCode = API_ERROR_CODES.DATABASE_QUERY_ERROR;
        errorMessage = 'データベースクエリの実行に失敗しました';
        break;
      case 'CONSTRAINT':
        errorCode = API_ERROR_CODES.DATABASE_CONSTRAINT_ERROR;
        errorMessage = 'データベース制約違反が発生しました';
        break;
      default:
        errorCode = API_ERROR_CODES.DATABASE_ERROR;
        errorMessage = 'データベース操作に失敗しました';
    }
    statusCode = 500;
  } else if (error instanceof Error) {
    // 一般的なエラー
    if (error.message.includes('timeout')) {
      errorCode = API_ERROR_CODES.DATABASE_ERROR;
      errorMessage = 'データベース接続がタイムアウトしました';
    } else if (error.message.includes('connection')) {
      errorCode = API_ERROR_CODES.DATABASE_ERROR;
      errorMessage = 'データベースへの接続に失敗しました';
    } else if (error.message.includes('auth')) {
      errorCode = API_ERROR_CODES.DATABASE_ERROR;
      errorMessage = 'データベース認証に失敗しました';
    }
  }

  // 開発環境では詳細なエラー情報を提供
  const errorResponse: ApiErrorResponse = {
    success: false,
    timestamp: new Date().toISOString(),
    error: {
      code: errorCode,
      message: errorMessage,
      ...(includeDetails && {
        details: {
          ...(requestId && { requestId }),
          ...(processingTime && { processingTime: `${processingTime}ms` }),
          ...(error instanceof Error && { 
            originalMessage: error.message,
            stack: error.stack 
          })
        }
      })
    }
  };

  return errorResponse;
}

/**
 * エラーレスポンスを送信する共通関数
 */
export function sendErrorResponse(
  res: NextApiResponse,
  error: unknown,
  options: ErrorHandlingOptions = {}
): void {
  const errorResponse = createErrorResponse(error, options);
  const statusCode = getHttpStatusFromErrorCode(errorResponse.error.code as ApiErrorCode);
  
  // ログ出力
  console.error(`[API Error] ${options.requestId || 'unknown'}: ${errorResponse.error.code} - ${errorResponse.error.message}`, {
    error: error instanceof Error ? error.message : error,
    stack: error instanceof Error ? error.stack : undefined,
    timestamp: errorResponse.timestamp
  });

  res.status(statusCode).json(errorResponse);
}

/**
 * エラーコードからHTTPステータスコードを取得
 */
function getHttpStatusFromErrorCode(errorCode: ApiErrorCode): number {
  switch (errorCode) {
    case API_ERROR_CODES.VALIDATION_ERROR:
    case API_ERROR_CODES.INVALID_FORMATION:
      return 400;
    case API_ERROR_CODES.NOT_FOUND:
      return 404;
    case API_ERROR_CODES.METHOD_NOT_ALLOWED:
      return 405;
    case API_ERROR_CODES.DATABASE_ERROR:
    case API_ERROR_CODES.DATABASE_CONNECTION_ERROR:
    case API_ERROR_CODES.DATABASE_TIMEOUT_ERROR:
    case API_ERROR_CODES.DATABASE_AUTH_ERROR:
    case API_ERROR_CODES.DATABASE_QUERY_ERROR:
    case API_ERROR_CODES.DATABASE_CONSTRAINT_ERROR:
    case API_ERROR_CODES.INTERNAL_ERROR:
    case API_ERROR_CODES.INSUFFICIENT_DATA:
    default:
      return 500;
  }
}

/**
 * バリデーションエラー専用の応答作成
 */
export function createValidationErrorResponse(
  message: string,
  errorCode: ApiErrorCode = API_ERROR_CODES.VALIDATION_ERROR,
  field?: string
): ApiErrorResponse {
  return {
    success: false,
    timestamp: new Date().toISOString(),
    error: {
      code: errorCode,
      message,
      ...(field && { details: { field } })
    }
  };
}

/**
 * バリデーションエラーを送信する共通関数
 */
export function sendValidationError(
  res: NextApiResponse,
  message: string,
  errorCode: ApiErrorCode = API_ERROR_CODES.VALIDATION_ERROR,
  field?: string
): void {
  const errorResponse = createValidationErrorResponse(message, errorCode, field);
  const statusCode = getHttpStatusFromErrorCode(errorCode);
  
  res.status(statusCode).json(errorResponse);
}