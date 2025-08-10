import { useEffect } from 'react';

const thresholds = {
  pc: 0.3, // PC用の閾値
  sp: 0.4 // SP用の閾値（必要に応じて変更可能）
};

/**
 * useInView: 要素表示監視フック
 *
 * 指定されたクラス名の要素がビューポートに入った際に「is-inview」クラスを付与するフックです。
 * IntersectionObserverを使用してパフォーマンス効率的な監視を行い、フェードインアニメーション等に使用できます。
 *
 * - IntersectionObserverによる効率的な監視
 * - デバイス別閾値設定（PC/SP）
 * - 一度表示されたら監視解除
 *
 * @example
 * // 基本的な使用例
 * function MyComponent() {
 *   useInView();
 *   return (
 *     <div className="inview__fadein">
 *       <p>この要素は表示時にフェードインします</p>
 *     </div>
 *   );
 * }
 *
 * @example
 * // 複数要素での使用
 * function ScrollPage() {
 *   useInView();
 *   return (
 *     <div>
 *       <div className="inview__fadein">要素1</div>
 *       <div className="inview__fadein">要素2</div>
 *       <div className="inview__fadein">要素3</div>
 *     </div>
 *   );
 * }
 *
 * @remarks
 * - 監視対象は「.inview__fadein」クラスを持つ要素
 * - PC閾値: 0.3、SP閾値: 0.4（調整可能）
 * - SSR対応済み（typeof window チェック）
 * - 768px以下をモバイルとして判定
 */
export function useInView() {
  useEffect(() => {
    // SSR対策
    if (typeof window === 'undefined') return;

    // デバイスタイプの判定
    const isMobile = window.innerWidth <= 768; // ブレイクポイントは適宜調整
    const threshold = isMobile ? thresholds.sp : thresholds.pc;

    // 監視対象の要素を取得
    const targets = document.querySelectorAll('.inview__fadein');
    if (!targets.length) return;

    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          // 要素が表示範囲に入った時
          entry.target.classList.add('is-inview');
          // 一度表示されたら監視を解除
          observer.unobserve(entry.target);
        }
      });
    }, {
      threshold: threshold,
      rootMargin: '10px' // 少し余裕を持たせる
    });

    // 各要素の監視を開始
    targets.forEach(target => {
      observer.observe(target);
    });

    // クリーンアップ
    return () => {
      targets.forEach(target => {
        observer.unobserve(target);
      });
    };
  }, []); // 依存配列は空（マウント時のみ実行）
}
