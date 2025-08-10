/**
 * フォトモーダル用の型定義
 */

/**
 * 画像データの型定義
 * @interface PhotoImage
 */
export interface PhotoImage {
  /** サムネイル画像のファイル名 */
  thumbnail: string;
  /** フル画像のファイル名 */
  full: string;
  /** 画像の代替テキスト */
  alt: string;
}

/**
 * デモ用の画像データ配列
 * 実際のプロジェクトでは外部データソースやCMSから取得
 */
export const demoImages: PhotoImage[] = [
  {
    thumbnail: 'placeholder-thumbnail-square.png',
    full: 'placeholder-landscape.png',
    alt: 'デモ画像 1'
  },
  {
    thumbnail: 'placeholder-thumbnail-square.png',
    full: 'placeholder-portrait.png',
    alt: 'デモ画像 2'
  },
  {
    thumbnail: 'placeholder-thumbnail-square.png',
    full: 'placeholder-landscape.png',
    alt: 'デモ画像 3'
  }
];