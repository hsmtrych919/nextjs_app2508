import React from 'react';
import { useTabSwitch } from '@/lib/hooks/useTabSwitch';
import typeStyles from '@/styles/modules/type.module.scss';

/**
 * SimpleTabDemo: タブ切り替え機能付きデモコンポーネント
 *
 * 複数のコンテンツをタブ形式で切り替え表示するコンポーネントです。
 * 既存のSCSSクラス（.c-tab__*）とuseTabSwitchカスタムフックを組み合わせて実装されています。
 *
 * - タブクリックによるコンテンツ切り替え
 * - キーボード操作対応（Enter、Space）
 * - アクセシビリティ対応（role属性、aria属性）
 * - 固定のサンプルコンテンツを表示
 *
 * @example
 * // 基本的な使用例
 * <SimpleTabDemo />
 *
 * @remarks
 * - useTabSwitchフックが必要です
 * - CSSクラス「c-tab__outer」「c-tab__list」「c-tab__list--item」「c-tab__content」「c-tab__item」「js-active」を使用
 */
export default function SimpleTabDemo() {
  const {
    handleTabClick,
    getTabItemClassName,
    getContentClassName
  } = useTabSwitch(0);

  const tabItems = [
    { label: 'tab1' },
    { label: 'tab2' },
    { label: 'tab3' }
  ];

  return (
    <div className="c-tab__outer">
      <ul className="c-tab__list">
        {tabItems.map((item, index) => (
          <li
            key={index}
            className={getTabItemClassName(index)}
            onClick={() => handleTabClick(index)}
            role="tab"
            aria-selected={getTabItemClassName(index).includes('js-active')}
            tabIndex={0}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                handleTabClick(index);
              }
            }}
          >
            {item.label}
          </li>
        ))}
      </ul>

      <div className="c-tab__content">
        <div className={getContentClassName(0)}>
          <h2 className={typeStyles['title--medium']}>tab1</h2>
          <p>Lorem ipsum dolor sit amet, consectetur adipisicing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.</p>
        </div>
        <div className={getContentClassName(1)}>
          <h2 className={typeStyles['title--medium']}>tab2</h2>
          <p>Lorem ipsum dolor sit amet, consectetur adipisicing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.</p>
        </div>
        <div className={getContentClassName(2)}>
          <h2 className={typeStyles['title--medium']}>tab3</h2>
          <p>Lorem ipsum dolor sit amet, consectetur adipisicing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.</p>
        </div>
      </div>
    </div>
  );
}
