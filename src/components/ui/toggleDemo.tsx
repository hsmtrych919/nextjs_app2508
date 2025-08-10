import React, { ReactNode } from 'react';
import { useToggleContent } from '@/lib/hooks/useToggleContent';

interface ToggleProps {
  children?: ReactNode;
}

/**
 * SimpleToggleDemo: 折りたたみ表示機能付きデモコンポーネント
 *
 * 「続きを読む/閉じる」ボタンでコンテンツの表示・非表示を切り替えるトグル機能のデモです。
 * GSAPアニメーションによる滑らかな高さ変更アニメーションが特徴です。
 *
 * - GSAPによる滑らかなアニメーション
 * - 「続きを読む/閉じる」ボタン自動切り替え
 * - カスタムchildren対応
 *
 * @param children トグル対象として表示するカスタムコンテンツ（省略時はデフォルトコンテンツを表示）
 *
 * @example
 * // 基本的な使用例（デフォルトコンテンツ）
 * <SimpleToggleDemo />
 *
 * @example
 * // カスタムコンテンツを指定
 * <SimpleToggleDemo>
 *   <section>
 *     <h3>カスタムタイトル</h3>
 *     <p>カスタムコンテンツです。長いテキストでも適切に折りたたまれます。画像付きのコンテンツも問題なく動作します。</p>
 *   </section>
 * </SimpleToggleDemo>
 *
 * @remarks
 * - useToggleContentフックが必要です
 * - GSAPライブラリが必要です
 * - CSSクラス「c-toggle__wrap」「c-toggle__title」「c-toggle__content」を使用
 */
export default function SimpleToggleDemo({ children }: ToggleProps) {
  useToggleContent('.c-toggle__wrap', '.c-toggle__title', '.c-toggle__content');

  return (
    <div className="c-toggle__wrap">
      <div className="c-toggle__title">
        <span className="c-toggle__button js-toggle-message">続きを読む</span>
      </div>
      <div className="c-toggle__content">
        {children || (
          <section>
            <p>Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.</p>
            <p>Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.<br/>Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur.<br/>Lorem ipsum dolor sit, amet consectetur adipisicing elit. Obcaecati vel nemo earum eligendi tempore, quis nam harum laudantium consectetur dolores quae quisquam voluptatum rem enim ipsum pariatur rerum explicabo distinctio!</p>
            <p>Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.<br/>Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur.<br/>Lorem ipsum dolor sit, amet consectetur adipisicing elit. Obcaecati vel nemo earum eligendi tempore, quis nam harum laudantium consectetur dolores quae quisquam voluptatum rem enim ipsum pariatur rerum explicabo distinctio!</p>
            <p>Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.<br/>Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur.<br/>Lorem ipsum dolor sit, amet consectetur adipisicing elit. Obcaecati vel nemo earum eligendi tempore, quis nam harum laudantium consectetur dolores quae quisquam voluptatum rem enim ipsum pariatur rerum explicabo distinctio!</p>
          </section>
        )}
      </div>
    </div>
  );
}
