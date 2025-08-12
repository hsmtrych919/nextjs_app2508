// サテライト投資管理アプリ - 環境設定管理
// Agent 2 - Phase 1-4: 環境別設定ファイル

export interface EnvironmentConfig {
  environment: 'development' | 'preview' | 'production';
  database: {
    name: string;
    local: boolean;
  };
  api: {
    version: string;
    baseUrl: string;
    timeout: number;
  };
  features: {
    debugMode: boolean;
    cronEnabled: boolean;
    logLevel: 'debug' | 'info' | 'warn' | 'error';
  };
  security: {
    corsOrigins: string[];
    allowedMethods: string[];
  };
}

// 開発環境設定
export const developmentConfig: EnvironmentConfig = {
  environment: 'development',
  database: {
    name: 'satellite-investment-db',
    local: true
  },
  api: {
    version: '1.0.0',
    baseUrl: 'http://localhost:3000',
    timeout: 30000
  },
  features: {
    debugMode: true,
    cronEnabled: false, // 開発環境ではCronを無効
    logLevel: 'debug'
  },
  security: {
    corsOrigins: ['http://localhost:3000', 'http://127.0.0.1:3000'],
    allowedMethods: ['GET', 'POST', 'OPTIONS']
  }
};

// プレビュー環境設定
export const previewConfig: EnvironmentConfig = {
  environment: 'preview',
  database: {
    name: 'satellite-investment-db-preview',
    local: false
  },
  api: {
    version: '1.0.0',
    baseUrl: 'https://preview-satellite-investment.pages.dev',
    timeout: 10000
  },
  features: {
    debugMode: true,
    cronEnabled: true,
    logLevel: 'info'
  },
  security: {
    corsOrigins: ['https://preview-satellite-investment.pages.dev'],
    allowedMethods: ['GET', 'POST']
  }
};

// 本番環境設定
export const productionConfig: EnvironmentConfig = {
  environment: 'production',
  database: {
    name: 'satellite-investment-db-prod',
    local: false
  },
  api: {
    version: '1.0.0',
    baseUrl: 'https://satellite-investment.pages.dev',
    timeout: 5000
  },
  features: {
    debugMode: false,
    cronEnabled: true,
    logLevel: 'warn'
  },
  security: {
    corsOrigins: ['https://satellite-investment.pages.dev'],
    allowedMethods: ['GET', 'POST']
  }
};

// 環境取得関数
export function getEnvironmentConfig(): EnvironmentConfig {
  const env = process.env.ENVIRONMENT || 
              process.env.NODE_ENV || 
              'development';

  switch (env) {
    case 'production':
      return productionConfig;
    case 'preview':
      return previewConfig;
    case 'development':
    default:
      return developmentConfig;
  }
}

// Cloudflare Workers環境での設定取得
export function getCloudflareConfig(env: any): EnvironmentConfig {
  const environment = env.ENVIRONMENT || 'development';
  
  const baseConfig = getEnvironmentConfig();
  
  // Cloudflare環境変数からの上書き
  return {
    ...baseConfig,
    environment: environment as any,
    features: {
      ...baseConfig.features,
      debugMode: env.DEBUG_MODE === 'true',
      logLevel: env.LOG_LEVEL || baseConfig.features.logLevel
    },
    api: {
      ...baseConfig.api,
      version: env.API_VERSION || baseConfig.api.version
    }
  };
}

// 設定検証関数
export function validateConfig(config: EnvironmentConfig): boolean {
  const required = [
    config.database.name,
    config.api.version,
    config.api.baseUrl
  ];
  
  return required.every(field => field && field.trim().length > 0);
}

// デバッグ用設定出力
export function logConfig(config: EnvironmentConfig): void {
  if (config.features.debugMode) {
    console.log('Environment Configuration:', {
      environment: config.environment,
      database: config.database.name,
      apiVersion: config.api.version,
      debugMode: config.features.debugMode,
      logLevel: config.features.logLevel
    });
  }
}