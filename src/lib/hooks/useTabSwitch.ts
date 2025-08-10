import { useState, useCallback } from 'react';

/**
 * カスタムフック: useTabSwitch
 *
 * タブ切り替え機能を提供するReact Hookです。
 * 指定したタブアイテムの状態管理とクラス名の生成を行います。
 *
 * - 初期アクティブタブの設定
 * - タブクリック時の状態切り替え
 * - アクティブ状態に応じたCSSクラス名の自動生成
 * - 既存のSCSSクラス（.c-tab__*、.js-active）との連携
 *
 * @param initialActiveIndex 初期アクティブタブのインデックス（デフォルト: 0）
 * @returns タブ操作用のオブジェクト
 *
 * @remarks
 * - SCSSクラス「c-tab__list--item」「c-tab__item」「js-active」を使用
 * - Next.js/React環境で利用してください
 * - タブコンポーネントと組み合わせて使用することを想定
 *
 * @example
 * ```tsx
 * const { handleTabClick, getTabItemClassName, getContentClassName } = useTabSwitch(0);
 * ```
 */
export const useTabSwitch = (initialActiveIndex: number = 0) => {
  const [activeIndex, setActiveIndex] = useState<number>(initialActiveIndex);

  /**
   * タブをクリックした時の処理
   * @param index クリックされたタブのインデックス
   */
  const handleTabClick = useCallback((index: number) => {
    setActiveIndex(index);
  }, []);

  /**
   * 指定されたインデックスがアクティブかどうかを判定
   * @param index 判定するインデックス
   * @returns アクティブかどうか
   */
  const isActive = useCallback((index: number) => {
    return activeIndex === index;
  }, [activeIndex]);

  /**
   * タブリストアイテムのクラス名を取得
   * @param index タブのインデックス
   * @returns クラス名
   */
  const getTabItemClassName = useCallback((index: number) => {
    return isActive(index)
      ? 'c-tab__list--item js-active'
      : 'c-tab__list--item';
  }, [isActive]);

  /**
   * タブコンテンツのクラス名を取得
   * @param index コンテンツのインデックス
   * @returns クラス名
   */
  const getContentClassName = useCallback((index: number) => {
    return isActive(index)
      ? 'c-tab__item js-active'
      : 'c-tab__item';
  }, [isActive]);

  return {
    activeIndex,
    handleTabClick,
    isActive,
    getTabItemClassName,
    getContentClassName,
  };
};
