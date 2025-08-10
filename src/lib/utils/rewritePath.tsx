import React, { ReactNode, useState, useEffect, useRef } from 'react';
import getConfig from 'next/config';
import Link from 'next/link';
import { getOptimizedImagePath } from './webpSupport';


const { publicRuntimeConfig } = getConfig();
const basePath = (publicRuntimeConfig && publicRuntimeConfig.basePath) || '';

/**
 * 環境に応じたキャッシュパラメータを取得
 * @returns キャッシュバスティング用のクエリパラメータ
 */
const getCacheParam = (): string => {
  // 開発環境でのみキャッシュバスティング
  if (process.env.NODE_ENV === 'development') {
    return `?v=${Date.now()}`;
  }
  // 本番環境では静的ビルドハッシュ
  return `?v=${process.env.NEXT_PUBLIC_BUILD_HASH || '1.0.0'}`;
};

/**
 * WebP最適化とキャッシュパラメータを適用した画像URLを取得
 * @param src 画像ファイル名（/img/以下の相対パス）
 * @returns 最適化された完全な画像URL
 */
const getImageSrc = (src: string): string => {
  const optimizedPath = getOptimizedImagePath(src);
  return `${basePath}/img/${optimizedPath}${getCacheParam()}`;
};

type ImgPathProps = {
  src?: string;
  alt?: string;
  className?: string;
};

/**
 * ImgPath: 画像パス書き換えコンポーネント
 *
 * Next.jsのbasePath設定に対応した画像表示コンポーネントです。
 * キャッシュバスティング機能付きで、デプロイ環境での画像更新問題を解決します。
 *
 * - basePath自動適用
 * - 環境に応じたキャッシュ戦略（開発: Date.now(), 本番: ビルドハッシュ）
 * - 標準的なimg要素として動作
 *
 * @param src 画像ファイル名（/img/以下の相対パス）
 * @param alt 画像の代替テキスト
 *
 * @example
 * // 基本的な使用例
 * <ImgPath src="logo.png" alt="ロゴ" />
 *
 * @example
 * // フォルダ階層がある場合
 * <ImgPath src="icons/user.svg" alt="ユーザーアイコン" />
 *
 * @example
 * // 動的な画像切り替え
 * const imageName = isActive ? 'active.png' : 'inactive.png';
 * <ImgPath src={imageName} alt="状態アイコン" />
 *
 * @remarks
 * - next/configのpublicRuntimeConfigが必要です
 * - 画像は/publicディレクトリの/img/以下に配置
 * - キャッシュバスティングによりビルド後も画像更新が反映されます
 */
export function ImgPath({ src = '', alt = '', className = '' }: ImgPathProps) {
  const [optimizedSrc, setOptimizedSrc] = useState(src);

  useEffect(() => {
    // クライアントサイドでWebP判定を再実行
    const optimized = getOptimizedImagePath(src);
    setOptimizedSrc(optimized);
  }, [src]);

  return <img src={getImageSrc(optimizedSrc)} alt={alt} className={className} />;
}

/**
 * getCacheParam関数をエクスポート（他のコンポーネントでも使用可能）
 */
export { getCacheParam };

interface LazyImgPathProps {
  src: string;
  alt: string;
  className?: string;
  context?: 'default' | 'modal';
  onLoad?: () => void;
}

/**
 * LazyImgPath: 遅延読み込み対応画像コンポーネント
 *
 * Intersection Observer APIを使用した遅延読み込み機能付き。
 * contextによって最適化戦略を切り替え。
 *
 * @param src 画像ファイル名（/img/以下の相対パス）
 * @param alt 画像の代替テキスト
 * @param className CSSクラス名
 * @param context 'default': rootMargin有効（グリッド等用）, 'modal': rootMargin無効（モーダル用）
 * @param onLoad 画像読み込み完了時のコールバック
 *
 * @example
 * // デフォルト使用（グリッド等）
 * <LazyImgPath src="image.jpg" alt="画像" />
 *
 * @example
 * // モーダル用（最適化）
 * <LazyImgPath src="image.jpg" alt="画像" context="modal" />
 */
export const LazyImgPath: React.FC<LazyImgPathProps> = ({
  src,
  alt,
  className = '',
  context = 'default',
  onLoad
}) => {
  const [isLoaded, setIsLoaded] = useState(false);
  const [isInView, setIsInView] = useState(false);
  const [optimizedSrc, setOptimizedSrc] = useState(src);
  const imgRef = useRef<HTMLImageElement>(null);

  useEffect(() => {
    // クライアントサイドでWebP判定を実行
    const optimized = getOptimizedImagePath(src);
    setOptimizedSrc(optimized);
  }, [src]);

  useEffect(() => {
    // contextに応じてObserver設定を最適化
    const observerConfig = context === 'modal'
      ? { threshold: 0.1 } // モーダル用：rootMargin不要
      : { threshold: 0.1, rootMargin: '50px' }; // デフォルト：少し早めに読み込み

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsInView(true);
          observer.disconnect();
        }
      },
      observerConfig
    );

    if (imgRef.current) {
      observer.observe(imgRef.current);
    }

    return () => observer.disconnect();
  }, [context]);

  const handleLoad = () => {
    setIsLoaded(true);
    onLoad?.();
  };

  return (
    <div ref={imgRef}>
      {isInView && (
        <img
          src={getImageSrc(optimizedSrc)}
          alt={alt}
          className={`${className} ${isLoaded ? 'loaded' : 'loading'}`}
          onLoad={handleLoad}
          loading="lazy"
        />
      )}
      {!isLoaded && isInView && (
        <div className="image-placeholder">読み込み中...</div>
      )}
    </div>
  );
};


/**
 * 隣接画像のプリロード機能
 * モーダルで使用し、次/前の画像を事前読み込み
 *
 * @param images 画像配列（fullプロパティを持つオブジェクトの配列）
 * @param currentIndex 現在表示中の画像インデックス
 *
 * @example
 * // PhotoModalでの使用例
 * const PhotoModal = ({ images, currentIndex }) => {
 *   useImagePreloader(images, currentIndex);
 *   // ...
 * };
 */
export const useImagePreloader = (
  images: { full: string }[],
  currentIndex: number
) => {
  useEffect(() => {
    // 配列の範囲チェック
    if (!images || images.length === 0 || currentIndex < 0 || currentIndex >= images.length) {
      return;
    }

    // 次の画像をプリロード（WebP最適化適用）
    const nextIndex = currentIndex + 1;
    if (nextIndex < images.length) {
      const nextImage = new Image();
      nextImage.src = getImageSrc(images[nextIndex].full);
    }

    // 前の画像もプリロード（WebP最適化適用）
    const prevIndex = currentIndex - 1;
    if (prevIndex >= 0) {
      const prevImage = new Image();
      prevImage.src = getImageSrc(images[prevIndex].full);
    }
  }, [images, currentIndex]);
};

type LinkPathProps = {
  link?: string;
  as?: string;
  className?: string;
  children?: ReactNode;
};

/**
 * LinkPath: 内部リンクパス書き換えコンポーネント
 *
 * Next.jsのbasePath設定に対応した内部リンクコンポーネントです。
 * Next.js Linkコンポーネントをラップしてパス書き換えを自動化します。
 *
 * - basePath自動適用
 * - Next.js Linkの全機能を継承
 * - className、children対応
 *
 * @param link リンク先のパス（href相当）
 * @param as 表示用のパス（as相当、通常はlinkと同じ値）
 * @param className CSSクラス名
 * @param children リンク内に表示する要素
 *
 * @example
 * // 基本的な使用例
 * <LinkPath link="/about" as="/about">
 *   <span>会社概要</span>
 * </LinkPath>
 *
 * @example
 * // ボタン風リンク
 * <LinkPath link="/contact" as="/contact" className="btn btn-primary">
 *   お問い合わせ
 * </LinkPath>
 *
 * @example
 * // 画像付きリンク
 * <LinkPath link="/products" as="/products" className="product-link">
 *   <ImgPath src="product-thumb.jpg" alt="商品" />
 *   <span>商品一覧</span>
 * </LinkPath>
 *
 * @remarks
 * - next/linkとnext/configが必要です
 * - 外部リンクには使用しないでください（通常のaタグを使用）
 * - basePath設定がない場合は通常のNext.js Linkとして動作
 */
export function LinkPath({ link = '', as, className, children }: LinkPathProps) {
  return (
    <Link href={link} as={`${basePath}${as}`} className={className}>
      {children}
    </Link>
  );
}

