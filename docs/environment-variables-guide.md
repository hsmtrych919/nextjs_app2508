# 環境変数管理ガイド
## Agent 2 - Phase 3項目2: 環境変数管理

生成日: 2025-08-11

### 現在のwrangler.tomlでの環境変数設定

#### 共通環境変数 (すべての環境で利用)
```toml
[vars]
API_VERSION = "1.0.0"
APP_NAME = "Satellite Investment Manager"
TYPE_SYSTEM_VERSION = "1.3.0"
```

#### 本番環境変数
```toml
[env.production.vars]
ENVIRONMENT = "production"
DEBUG_MODE = "false"
LOG_LEVEL = "warn"
```

#### プレビュー環境変数
```toml
[env.preview.vars]
ENVIRONMENT = "preview"
DEBUG_MODE = "true"
LOG_LEVEL = "info"
```

#### 開発環境変数
```toml
[env.development.vars]
ENVIRONMENT = "development"
DEBUG_MODE = "true"
LOG_LEVEL = "debug"
```

### Cloudflare Dashboard での追加環境変数設定方法

#### 1. Pages Settings での環境変数
```bash
# コマンドラインからの設定
wrangler pages var put CUSTOM_API_KEY --env=production
wrangler pages var put DATABASE_URL --env=production
```

#### 2. Secrets の設定（機密情報）
```bash
# 本番環境のSecret設定
wrangler pages secret put API_SECRET_KEY --env=production
wrangler pages secret put ENCRYPTION_KEY --env=production
```

### 環境変数の使用方法

#### Pages Functions内での環境変数取得
```typescript
// pages/api/data.ts での例
export const onRequest: PagesFunction<Env> = async (context) => {
  const { env } = context;
  
  // 環境変数の取得
  const apiVersion = env.API_VERSION;
  const environment = env.ENVIRONMENT;
  const debugMode = env.DEBUG_MODE === 'true';
  
  // ログレベルに応じたログ出力
  if (debugMode && env.LOG_LEVEL === 'debug') {
    console.log('Debug mode enabled');
  }
};
```

### セキュリティ設定

#### 本番環境で必要な最低限の設定
- `DEBUG_MODE=false` - デバッグ情報の無効化
- `LOG_LEVEL=warn` - 本番用ログレベル
- `ENVIRONMENT=production` - 環境識別

#### 機密情報の管理
- データベースURLやAPIキーはSecretsとして設定
- 環境変数は公開情報のみ
- ローカル開発時は`.env.local`（gitignore対象）

### 環境変数確認コマンド
```bash
# 設定済み環境変数の確認
wrangler pages var list --env=production
wrangler pages var list --env=preview

# Secretsの確認
wrangler pages secret list --env=production
```