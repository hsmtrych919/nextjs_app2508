import { useEffect, useRef } from 'react';
import ScrollHint from 'scroll-hint';

/**
 * カスタムフック: useTableScroll
 *
 * table要素がはみ出る場合、両端のシャドウ＋ヒントでスクロールできることを示唆するフックです。
 * 元のJavaScript関数をReact対応にしたものです。
 *
 * @param tableOuterSelector テーブル外側コンテナ要素のセレクタ（例: '.c-table__responsive'）
 *
 * @remarks
 * - ScrollHintライブラリが必要です
 * - 元のJavaScript関数の動作を保持
 *
 * @example
 * ```tsx
 * function MyComponent() {
 *   useTableScroll('.c-table__responsive');
 *   return <div>...</div>;
 * }
 * ```
 */
export const useTableScroll = (tableOuterSelector: string) => {
  useEffect(() => {
    const nodes = document.querySelectorAll(tableOuterSelector);
    const scrollHandlers = new Map<HTMLElement, () => void>();

    nodes.forEach(node => {
      const element = node as HTMLElement;
      const parentElement = element.parentElement;

      // はみ出る場合は右の影追加
      if (element.scrollWidth - element.clientWidth > 2) {
        parentElement?.classList.add('js-shadow__after');
      }

      const handleScroll = () => {
        const cur = element.scrollLeft;
        if (cur == 0) {
          parentElement?.classList.remove('js-shadow__before');
        } else {
          // const max = node.scrollWidth - node.parentNode.clientWidth;
          const max = element.scrollWidth - element.clientWidth;
          if (max - cur <= 1) {
            parentElement?.classList.remove('js-shadow__after');
          } else {
            parentElement?.classList.add('js-shadow__before');
            parentElement?.classList.add('js-shadow__after');
          }
        }
      };

      element.addEventListener('scroll', handleScroll);
      scrollHandlers.set(element, handleScroll);
    });

    // ScrollHint初期化
    const scrollHint = new ScrollHint(tableOuterSelector, {
      // applyToParents: true, // 親要素内に追加
      offset: 40,
      remainingTime: '2000',
      i18n: {
        scrollable: 'スクロールできます'
      }
    });

    // クリーンアップ
    return () => {
      scrollHandlers.forEach((handler, element) => {
        element.removeEventListener('scroll', handler);
      });
      scrollHandlers.clear();
    };

  }, [tableOuterSelector]);
};
