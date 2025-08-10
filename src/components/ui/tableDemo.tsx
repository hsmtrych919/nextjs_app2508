import React from 'react';
import { useTableScroll } from '@/lib/hooks/useTableScroll';

/**
 * SimpleTableDemo: スクロール対応テーブルデモコンポーネント
 *
 * 横スクロール可能なテーブルコンポーネントです。
 * はみ出し部分の視覚的ヒントとスクロール位置に応じたシャドウ表示機能を提供します。
 *
 * - ScrollHintによるスクロール可能性の示唆
 * - スクロール位置に応じた左右シャドウの動的表示
 * - レスポンシブ対応
 * - 固定のサンプルデータを表示
 *
 * @example
 * // 基本的な使用例
 * <SimpleTableDemo />
 *
 * @remarks
 * - useTableScrollフックが必要です
 * - ScrollHintライブラリが必要です
 * - CSSクラス「c-table__responsive--outer」「c-table__responsive」「c-table-spec」を使用
 */
export default function SimpleTableDemo() {
  useTableScroll('.c-table__responsive');

  return (
    <div className="c-table__responsive--outer">
      <div className="c-table__responsive scroll-hint">
        <table className="c-table-spec">
          <tbody>
            <tr>
              <th colSpan={2}>機体巾<span className="c-table-spec__unit">( mm )</span></th>
              <th colSpan={2}>機体長<span className="c-table-spec__unit">( mm )</span></th>
              <th colSpan={2}>通過荷重<span className="c-table-spec__unit">( kg )</span></th>
            </tr>
            <tr>
              <td rowSpan={3} className="fw-500">Ⅰ</td>
              <td rowSpan={3}>1,500</td>
              <td className="fw-500">20</td>
              <td>2,000</td>
              <td rowSpan={3} className="fw-500">6</td>
              <td rowSpan={3}>&ensp;6,000</td>
            </tr>
            <tr>
              <td className="fw-500">25</td>
              <td>2,500</td>
            </tr>
            <tr>
              <td className="fw-500">30</td>
              <td>3,000</td>
            </tr>
            <tr>
              <td rowSpan={3} className="fw-500">Ⅱ</td>
              <td rowSpan={3}>1,750</td>
              <td className="fw-500">20</td>
              <td>2,000</td>
              <td rowSpan={6} className="fw-500">6<br />9<br />11</td>
              <td rowSpan={6}>&ensp;6,000<br />&ensp;9,000<br />11,000</td>
            </tr>
            <tr>
              <td className="fw-500">25</td>
              <td>2,500</td>
            </tr>
            <tr>
              <td className="fw-500">30</td>
              <td>3,000</td>
            </tr>
            <tr>
              <td rowSpan={3} className="fw-500">Ⅲ</td>
              <td rowSpan={3}>2,000</td>
              <td className="fw-500">20</td>
              <td>2,000</td>
            </tr>
            <tr>
              <td className="fw-500">25</td>
              <td>2,500</td>
            </tr>
            <tr>
              <td className="fw-500">30</td>
              <td>3,000</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
}
