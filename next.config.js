const path = require('path');
const crypto = require('crypto');

// ビルド時にハッシュを生成
const generateBuildHash = () => {
  return crypto.randomBytes(8).toString('hex');
};

const buildHash = generateBuildHash();

/**
 * @type {import('next').NextConfig}
 */
const nextConfig = {
  // Strict Mode
  reactStrictMode: true,
  basePath: '',

  // 静的エクスポート設定（フロントエンド用）
  output: 'export',

  // 環境変数でビルドハッシュを提供
  env: {
    NEXT_PUBLIC_BUILD_HASH: buildHash,
  },

  // urlにスラッシュ追記
  trailingSlash: true,

  // Change the output directory `out` -> `dist`
  distDir: '_dist',

  // Imageタグエラー対策
  images: {
    loader: 'custom',
    unoptimized: true,
  },

  // ESLintチェック無効化（ビルド時）
  eslint: {
    ignoreDuringBuilds: true,
  },

  // API Routes除外設定
  experimental: {
    outputFileTracingRoot: path.join(__dirname, '../../'),
  },
};

module.exports = nextConfig;
