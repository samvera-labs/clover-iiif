import { CanvasNormalized } from "@iiif/presentation-3";

export interface CanvasBehavior {
  isAutoAdvance: boolean;
  isRepeat: boolean;
  duration: number;
}

export const getCanvasBehavior = (
  vault: any,
  canvasId: string,
): CanvasBehavior => {
  const canvas: CanvasNormalized = vault.get(canvasId);

  if (!canvas) {
    return { isAutoAdvance: false, isRepeat: false, duration: 0 };
  }

  const behavior = canvas.behavior || [];
  const behaviorArray = Array.isArray(behavior) ? behavior : [behavior];

  return {
    isAutoAdvance: behaviorArray.includes("auto-advance"),
    isRepeat: behaviorArray.includes("repeat"),
    duration: canvas.duration || 0,
  };
};
