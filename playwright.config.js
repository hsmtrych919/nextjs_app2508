// @ts-check
const { defineConfig, devices } = require('@playwright/test');

/**
 * @see https://playwright.dev/docs/test-configuration
 */
module.exports = defineConfig({
  testDir: './tests',

  /* すべてのテストを並列実行 */
  fullyParallel: true,

  /* CI環境でのみfail fastを有効化 */
  forbidOnly: !!process.env.CI,

  /* CI環境でのリトライ設定 */
  retries: process.env.CI ? 2 : 0,

  /* テスト並列実行数の最適化 */
  workers: process.env.CI ? 1 : undefined,

  /* HTMLレポート生成 */
  reporter: 'html',

  /* 全プロジェクト共通設定 */
  use: {
    /* 失敗時にトレース収集 */
    trace: 'on-first-retry',

    /* スクリーンショット設定 */
    screenshot: 'only-on-failure',

    /* ビデオ録画設定 */
    video: 'retain-on-failure'
  },

  /* プロジェクト設定 - Chrome プライベートモード + iPhone 12 Pro エミュレーション */
  projects: [
    {
      name: 'chromium-private-iphone-12-pro',
      use: {
        ...devices['iPhone 12 Pro'],
        browserName: 'chromium',

        /* プライベートブラウジングモード有効化 */
        launchOptions: {
          args: ['--incognito']
        }
      }
    }
  ]
});