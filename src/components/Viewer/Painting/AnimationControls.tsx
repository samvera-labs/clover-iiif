import {
  AnimationBar,
  AnimationButton,
  AnimationControlsWrapper,
  AnimationCounter,
} from "./AnimationControls.styled";

export { AnimationBar };

import React from "react";
import { useCloverTranslation } from "src/i18n/useCloverTranslation";

const PlayIcon = ({ title }: { title: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512">
    <title>{title}</title>
    <path d="M133 440a35.37 35.37 0 01-17.5-4.67c-12-6.8-19.46-20-19.46-34.33V111c0-14.37 7.46-27.53 19.46-34.33a35.13 35.13 0 0135.77.45l247.85 148.36a36 36 0 010 61.11L151.23 435a35.5 35.5 0 01-18.23 5z" />
  </svg>
);

const PauseIcon = ({ title }: { title: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512">
    <title>{title}</title>
    <path d="M224 432h-80V80h80zm144 0h-80V80h80z" />
  </svg>
);

const PreviousFrameIcon = ({ title }: { title: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512">
    <title>{title}</title>
    <path d="M112 64a16 16 0 0116 16v136.43L360.77 77.11a35.13 35.13 0 0135.77.45c12 6.8 19.46 20 19.46 34.33v288.22c0 14.37-7.46 27.53-19.46 34.33a35.13 35.13 0 01-35.77.45L128 295.57V432a16 16 0 01-32 0V80a16 16 0 0116-16z" />
  </svg>
);

const NextFrameIcon = ({ title }: { title: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512">
    <title>{title}</title>
    <path d="M400 64a16 16 0 00-16 16v136.43L151.23 77.11a35.13 35.13 0 00-35.77.45C103.46 84.36 96 97.52 96 111.89v288.22c0 14.37 7.46 27.53 19.46 34.33a35.13 35.13 0 0035.77.45L384 295.57V432a16 16 0 0032 0V80a16 16 0 00-16-16z" />
  </svg>
);

const RepeatIcon = ({ title }: { title: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512">
    <title>{title}</title>
    <path fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="32" d="M320 120l48 48-48 48"/>
    <path d="M352 168H144a80.24 80.24 0 00-80 80v16M192 392l-48-48 48-48" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="32"/>
    <path d="M160 344h208a80.24 80.24 0 0080-80v-16" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="32"/>
  </svg>
);

interface AnimationControlsProps {
  frameIndex: number;
  isPlaying: boolean;
  isRepeat: boolean;
  totalFrames: number;
  onPlay: () => void;
  onPause: () => void;
  onPrevFrame: () => void;
  onNextFrame: () => void;
  onToggleRepeat: () => void;
}

const AnimationControls: React.FC<AnimationControlsProps> = ({
  frameIndex,
  isPlaying,
  isRepeat,
  totalFrames,
  onPlay,
  onPause,
  onPrevFrame,
  onNextFrame,
  onToggleRepeat,
}) => {
  const { t } = useCloverTranslation();

  return (
    <AnimationControlsWrapper className="clover-viewer-animation-controls">
      <AnimationButton
        onClick={onPrevFrame}
        disabled={frameIndex === 0}
        type="button"
        aria-label={t("canvasAnimationPreviousFrame")}
      >
        <PreviousFrameIcon title={t("canvasAnimationPreviousFrame")} />
      </AnimationButton>

      <AnimationButton
        onClick={isPlaying ? onPause : onPlay}
        type="button"
        aria-label={isPlaying ? t("canvasAnimationPause") : t("canvasAnimationPlay")}
      >
        {isPlaying ? (
          <PauseIcon title={t("canvasAnimationPause")} />
        ) : (
          <PlayIcon title={t("canvasAnimationPlay")} />
        )}
      </AnimationButton>

      <AnimationButton
        onClick={onToggleRepeat}
        type="button"
        aria-label={t("canvasAnimationRepeat")}
        aria-pressed={isRepeat}
        data-active={isRepeat}
      >
        <RepeatIcon title={t("canvasAnimationRepeat")} />
      </AnimationButton>

      <AnimationButton
        onClick={onNextFrame}
        disabled={frameIndex === totalFrames - 1}
        type="button"
        aria-label={t("canvasAnimationNextFrame")}
      >
        <NextFrameIcon title={t("canvasAnimationNextFrame")} />
      </AnimationButton>

      <AnimationCounter>
        {frameIndex + 1} <em>/</em> {totalFrames}
      </AnimationCounter>
    </AnimationControlsWrapper>
  );
};

export default AnimationControls;
