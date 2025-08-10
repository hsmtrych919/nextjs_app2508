const path = require('path');
const crypto = require('crypto');

// /_next/static/からの呼び出し対策
// hrefやsrcは絶対パスで指定
const isProd = process.env.NODE_ENV === 'production';
const isRealDeploy = process.env.REAL_DEPLOY === 'true'; // 本番デプロイ判定用

// ビルド時にハッシュを生成
const generateBuildHash = () => {
  return crypto.randomBytes(8).toString('hex');
};

const buildHash = generateBuildHash();

// 開発時チェック用：REAL_DEPLOY=trueの時のみ本番URL適用
const prefixPath = (isProd && isRealDeploy) ? 'https://xxx.com' : '';

/**
 * @type {import('next').NextConfig}
 */
const nextConfig = {
  // Strict Mode
  reactStrictMode: true,
  output: 'export',
  basePath: '',
  // css,jsのアセットファイルのパスにプレフィックスをつける
  assetPrefix: prefixPath,
  // 画像やhrefのパスにプレフィックスをつける。利用ファイルにて設定必要
  publicRuntimeConfig: {
    basePath: prefixPath,
  },

  // 環境変数でビルドハッシュを提供
  env: {
    NEXT_PUBLIC_BUILD_HASH: buildHash,
  },

  // Optional: Change links `/me` -> `/me/` and emit `/me.html` -> `/me/index.html`
  // urlにスラッシュ追記
  trailingSlash: true,

  // Optional: Prevent automatic `/me` -> `/me/`, instead preserve `href`
  // skipTrailingSlashRedirect: true,

  // Optional: Change the output directory `out` -> `dist`
  distDir: '_dist',

  // Imageタグエラー対策
  images: {
    loader: 'custom',
  },
};

module.exports = nextConfig;