import { useCallback, useEffect, useRef, useState } from "react";

import { AnimationFrame } from "src/hooks/use-iiif/getAnimationFrames";

export interface UseCanvasAnimationOptions {
  frames: AnimationFrame[];
  duration: number;
  isAutoAdvance: boolean;
  isRepeat: boolean;
  playbackRate: number;
  onComplete?: () => void;
}

export interface UseCanvasAnimationResult {
  frameIndex: number;
  isPlaying: boolean;
  totalFrames: number;
  play: () => void;
  pause: () => void;
  prevFrame: () => void;
  nextFrame: () => void;
}

export const useCanvasAnimation = ({
  frames,
  duration,
  isAutoAdvance,
  isRepeat,
  playbackRate,
  onComplete,
}: UseCanvasAnimationOptions): UseCanvasAnimationResult => {
  const [frameIndex, setFrameIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(isAutoAdvance);
  const totalFrames = frames.length;

  const onCompleteRef = useRef(onComplete);
  useEffect(() => {
    onCompleteRef.current = onComplete;
  });

  useEffect(() => {
    setFrameIndex(0);
    setIsPlaying(isAutoAdvance);
  }, [frames]);

  const frameInterval =
    totalFrames > 0 ? (duration / totalFrames / playbackRate) * 1000 : 0;

  useEffect(() => {
    if (!isPlaying || totalFrames === 0 || frameInterval <= 0) return;

    const timer = setTimeout(() => {
      setFrameIndex((prev) => {
        const next = prev + 1;
        if (next >= totalFrames) {
          if (isRepeat) return 0;
          setIsPlaying(false);
          onCompleteRef.current?.();
          return prev;
        }
        return next;
      });
    }, frameInterval);

    return () => clearTimeout(timer);
  }, [isPlaying, frameIndex, frameInterval, isRepeat, totalFrames]);

  const play = useCallback(() => setIsPlaying(true), []);
  const pause = useCallback(() => setIsPlaying(false), []);

  const prevFrame = useCallback(() => {
    setIsPlaying(false);
    setFrameIndex((prev) => Math.max(0, prev - 1));
  }, []);

  const nextFrame = useCallback(() => {
    setIsPlaying(false);
    setFrameIndex((prev) => Math.min(totalFrames - 1, prev + 1));
  }, [totalFrames]);

  return { frameIndex, isPlaying, totalFrames, play, pause, prevFrame, nextFrame };
};
