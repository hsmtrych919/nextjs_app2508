// サテライト投資管理アプリ - Drizzle Kit 設定ファイル
const { defineConfig } = require('drizzle-kit');

module.exports = defineConfig({
  schema: './src/lib/utils/schema.ts',
  out: './db/migrations',
  dialect: 'sqlite',
  driver: 'd1-http',
  dbCredentials: {
    // Cloudflare D1用の設定
    // wrangler.tomlで設定されるデータベース名
    databaseId: 'your-database-id',
    accountId: 'your-account-id',
    token: 'your-api-token'
  },
  verbose: true,
  strict: true,
});