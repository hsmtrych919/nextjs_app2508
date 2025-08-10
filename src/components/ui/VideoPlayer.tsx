import React, { useRef, useCallback } from 'react';
import { getVideoSrc, getVideoThumbnailSrc } from '@/lib/utils/videoPath';

interface VideoPlayerProps {
  videoSrc: string;
  posterSrc: string;
  className?: string;
  containerClassName?: string;
  aspectRatio?: '16by9' | '4by3' | '1by1';
}

/**
 * VideoPlayer: 動画表示コンポーネント
 *
 * 動画ファイルとサムネイル画像を表示する再利用可能コンポーネントです。
 * videoPath.tsxと連携してパス管理とキャッシュバスティングを自動化します。
 *
 * @param videoSrc 動画ファイル名（/img/以下の相対パス）
 * @param posterSrc サムネイル画像ファイル名（/img/以下の相対パス）
 * @param className video要素に適用する追加CSSクラス
 * @param containerClassName コンテナdivに適用する追加CSSクラス
 * @param aspectRatio アスペクト比（デフォルト: 16by9）
 *
 * @example
 * // 基本的な使用例
 * <VideoPlayer videoSrc="video.mp4" posterSrc="thumbnail.png" />
 *
 * @example
 * // アスペクト比指定
 * <VideoPlayer 
 *   videoSrc="demo.mp4" 
 *   posterSrc="demo-thumb.png"
 *   aspectRatio="4by3"
 * />
 */
const VideoPlayer: React.FC<VideoPlayerProps> = ({
  videoSrc,
  posterSrc,
  className = '',
  containerClassName = '',
  aspectRatio = '16by9'
}) => {
  const videoRef = useRef<HTMLVideoElement>(null);

  /**
   * 動画エラー時の処理
   */
  const handleVideoError = useCallback((e: React.SyntheticEvent<HTMLVideoElement, Event>) => {
    console.warn('動画の読み込みに失敗しました:', videoSrc);
    // エラー時はサムネイルのみ表示される
  }, [videoSrc]);

  // アスペクト比に応じたCSSクラス名を生成
  const responsiveClass = `embed-responsive embed-responsive-${aspectRatio}`;

  return (
    <div className={`${responsiveClass} ${containerClassName}`}>
      <video
        ref={videoRef}
        className={className}
        data-testid="video-player"
        controls
        preload="metadata"
        muted
        playsInline
        poster={getVideoThumbnailSrc(posterSrc)}
        src={getVideoSrc(videoSrc)}
        onError={handleVideoError}
      >
        <p>お使いのブラウザは動画の再生に対応していません。</p>
      </video>
    </div>
  );
};

export default VideoPlayer;