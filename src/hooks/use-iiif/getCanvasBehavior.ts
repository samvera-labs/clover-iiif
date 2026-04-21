import { CanvasNormalized, ManifestNormalized } from "@iiif/presentation-3";

export interface CanvasBehavior {
  isAutoAdvance: boolean;
  isManifestAutoAdvance: boolean;
  isRepeat: boolean;
  duration: number;
}

export const getCanvasBehavior = (
  vault: any,
  canvasId: string,
  manifestId?: string,
): CanvasBehavior => {
  const canvas: CanvasNormalized = vault.get(canvasId);

  if (!canvas) {
    return {
      isAutoAdvance: false,
      isManifestAutoAdvance: false,
      isRepeat: false,
      duration: 0,
    };
  }

  const canvasBehavior = canvas.behavior || [];
  const canvasBehaviorArray = Array.isArray(canvasBehavior)
    ? canvasBehavior
    : [canvasBehavior];

  let manifestBehaviorArray: string[] = [];
  if (manifestId) {
    const manifest: ManifestNormalized = vault.get(manifestId);
    if (manifest) {
      const manifestBehavior = manifest.behavior || [];
      manifestBehaviorArray = Array.isArray(manifestBehavior)
        ? manifestBehavior
        : [manifestBehavior];
    }
  }

  // Canvas inherits from manifest when it has no behavior of its own
  const effectiveBehavior =
    canvasBehaviorArray.length > 0 ? canvasBehaviorArray : manifestBehaviorArray;

  return {
    isAutoAdvance: effectiveBehavior.includes("auto-advance"),
    isManifestAutoAdvance: manifestBehaviorArray.includes("auto-advance"),
    isRepeat: effectiveBehavior.includes("repeat"),
    duration: canvas.duration || 0,
  };
};
