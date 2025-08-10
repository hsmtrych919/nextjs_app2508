/**
 * WebPサポート検出ユーティリティ
 * @fileoverview ブラウザのWebPサポート検出と画像パス最適化機能
 */

let webpSupported: boolean | null = null;

/**
 * ブラウザがWebPをサポートしているかチェック
 * 
 * Canvas APIを使用してWebPサポートを検出します。
 * 結果はキャッシュされ、複数回呼び出されても処理は1回のみ実行されます。
 * 
 * @returns WebPサポートの真偽値
 * 
 * @example
 * if (supportsWebP()) {
 *   console.log('このブラウザはWebPをサポートしています');
 * }
 */
export const supportsWebP = (): boolean => {
  // SSR対応：サーバーサイドでは常にfalseを返す
  if (typeof document === 'undefined') return false;
  
  // 既にチェック済みの場合はキャッシュを返す
  if (webpSupported !== null) return webpSupported;

  try {
    const canvas = document.createElement('canvas');
    canvas.width = 1;
    canvas.height = 1;
    const supported = canvas.toDataURL('image/webp').startsWith('data:image/webp');
    webpSupported = supported;
    return supported;
  } catch (error) {
    // Canvas APIが利用できない場合はWebP非対応として扱う
    webpSupported = false;
    return false;
  }
};

/**
 * 画像パスをWebP対応に最適化
 * 
 * ブラウザがWebPをサポートしている場合、jpg/jpeg/png拡張子をwebpに変換します。
 * WebP非対応ブラウザでは元のパスをそのまま返します。
 * 
 * @param originalPath 元の画像パス（例：'image.jpg'）
 * @returns 最適化された画像パス（例：'image.webp' または 'image.jpg'）
 * 
 * @example
 * // WebP対応ブラウザの場合
 * getOptimizedImagePath('photo.jpg'); // 'photo.webp'
 * 
 * @example
 * // WebP非対応ブラウザの場合
 * getOptimizedImagePath('photo.jpg'); // 'photo.jpg'
 * 
 * @example
 * // WebP以外の形式はそのまま
 * getOptimizedImagePath('icon.svg'); // 'icon.svg'
 */
export const getOptimizedImagePath = (originalPath: string): string => {
  if (!supportsWebP()) {
    return originalPath;
  }

  // jpg, jpeg, png を webp に変換（大文字小文字を問わない）
  return originalPath.replace(/\.(jpg|jpeg|png)$/i, '.webp');
};

/**
 * WebPサポート状態のリセット
 * テスト用途でキャッシュをクリアする場合に使用
 * 
 * @internal テスト用途のみ
 */
export const resetWebPSupport = (): void => {
  webpSupported = null;
};