import { useEffect } from 'react';
import { gsap } from 'gsap';

interface ToggleState {
  isOpen: boolean;
  isAnimating: boolean;
}

function updateToggleText(index: number, currentHeight: string, nodeTitle: NodeListOf<Element>) {
  const toggleText = nodeTitle[index].parentElement?.querySelector('.js-toggle-message');
  if (toggleText) {
    toggleText.textContent = currentHeight === '100px' ? '閉じる' : '続きを読む';
  }
}

/**
 * カスタムフック: useToggleContent
 *
 * 指定した要素群に「続きを読む/閉じる」トグル機能を付与します。
 * タイトル要素をクリックすると、対応するコンテンツ要素の高さをGSAPアニメーションで切り替えます。
 *
 * - 初期状態ではコンテンツの高さは200pxに設定されます。
 * - トグル時に高さをコンテンツのscrollHeightまで拡張し、「閉じる」ボタンに切り替わります。
 * - 再度トグルすると高さを200pxに戻し、「続きを読む」ボタンに切り替わります。
 * - ウィンドウリサイズ時にコンテンツの高さを再計算します。
 *
 * @param elemWrap   トグル対象のラップ要素のセレクタ（例: '.js-toggle-wrap'）
 * @param elemTitle  トグルボタンとなるタイトル要素のセレクタ（例: '.js-toggle-title'）
 * @param elemContent トグル対象のコンテンツ要素のセレクタ（例: '.js-toggle-content'）
 *
 * @remarks
 * - タイトル要素の親に`.js-toggle-message`クラスの要素が必要です（トグルメッセージ表示用）。
 * - GSAPライブラリが必要です。
 * - Next.js/React環境で利用してください。
 */

export function useToggleContent(elemWrap: string, elemTitle: string, elemContent: string) {
  useEffect(() => {
    const nodeTitle = document.querySelectorAll(elemTitle);
    const nodeContent = document.querySelectorAll(elemContent);
    let contentHeight: number[] = [];
    const ms = 0.3; // GSAPは秒単位
    const initialHeight = '100px'; // 開始時の高さ

    const updateContentHeight = () => {
      contentHeight = [];
      nodeContent.forEach((node) => {
        contentHeight.push((node as HTMLElement).scrollHeight);
        const element = node as HTMLElement;
        element.style.overflow = 'hidden';
        element.style.height = initialHeight;
      });
    };

    updateContentHeight();

    const toggleState: ToggleState[] = Array.from({ length: nodeTitle.length }, () => ({
      isOpen: false,
      isAnimating: false,
    }));

    const toggleControl = (index: number) => {
      if (toggleState[index].isAnimating) return;

      const currentToggleState = toggleState[index];
      const toggleWrap = nodeTitle[index].closest(elemWrap);

      // console.log('toggleWrap before toggle:', toggleWrap);

      if (toggleWrap) {
        toggleWrap.classList.toggle('js-active', !currentToggleState.isOpen);
      }

      // console.log('toggleWrap after toggle:', toggleWrap);

      toggleState[index] = {
        ...currentToggleState,
        isOpen: !currentToggleState.isOpen,
        isAnimating: true,
      };

      const element = nodeContent[index] as HTMLElement;
      const currentHeight = element.style.height;
      const targetHeight = currentHeight === initialHeight ? `${contentHeight[index]}px` : initialHeight;

      // GSAPアニメーション
      gsap.to(element, {
        height: targetHeight,
        duration: ms,
        ease: 'circ.out',
        onComplete: () => {
          toggleState[index] = {
            ...toggleState[index],
            isAnimating: false,
          };
          updateToggleText(index, currentHeight, nodeTitle);
        }
      });
    };

    const handleToggleControl = (event: Event) => {
      const target = event.currentTarget as any;
      const index = target.index;
      toggleControl(index);
    };

    // イベントリスナーの追加
    for (let i = 0; i < nodeTitle.length; i++) {
      (nodeTitle[i] as any).index = i;
      nodeTitle[i].addEventListener('mousedown', handleToggleControl);
    }

    // ウィンドウのリサイズイベントを監視し、リサイズが発生した際にcontentHeightを更新
    window.addEventListener('resize', updateContentHeight);

    // クリーンアップ時のイベントリスナーの削除
    return () => {
      for (let i = 0; i < nodeTitle.length; i++) {
        nodeTitle[i].removeEventListener('mousedown', handleToggleControl);
      }
      // ウィンドウがアンマウントされる際にリサイズイベントのリスナーも削除
      window.removeEventListener('resize', updateContentHeight);
    };
  }, [elemWrap, elemTitle, elemContent]);
}