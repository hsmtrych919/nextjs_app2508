import { useEffect, ReactNode } from 'react';
import Header from '@/components/layout/header';
import Footer from '@/components/layout/footer';
import { smoothScroll } from '@/lib/utils/smoothScroll';
import { linkIgnore } from '@/lib/utils/linkIgnore';

interface LayoutProps {
  children: ReactNode;
}

/**
 * LayoutBasic: 基本レイアウトコンポーネント
 *
 * ヘッダー、メインコンテンツ、フッターの標準的な3段構成レイアウトを提供します。
 * smoothScrollとlinkIgnoreユーティリティを自動初期化してユーザビリティを向上させます。
 *
 * - Header/Main/Footer構成
 * - smoothScroll自動初期化
 * - linkIgnore自動初期化
 *
 * @param children メインコンテンツ領域に表示する内容
 *
 * @example
 * // 基本的な使用例
 * <LayoutBasic>
 *   <h1>ページタイトル</h1>
 *   <p>ページコンテンツ</p>
 * </LayoutBasic>
 *
 * @remarks
 * - Header、Footerコンポーネントが必要です
 * - smooth-scroll、linkIgnoreユーティリティが必要です
 * - useEffectで各ユーティリティを初期化します
 */
export default function LayoutBasic({ children }: LayoutProps) {

  useEffect(() => {
    smoothScroll();
    linkIgnore();
  });

  return (
    <>
      <Header />
      <main>{children}</main>
      <Footer />
    </>
  );
}