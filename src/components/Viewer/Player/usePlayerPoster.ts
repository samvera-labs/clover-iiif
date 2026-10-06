import { useMemo } from "react";
import { CanvasNormalized } from "@iiif/presentation-3";
import { getPaintingResource } from "src/hooks/use-iiif/getPaintingResource";
import { useViewerState } from "src/context/viewer-context";

/** Resolve synchronously so the preview is available before the player module loads. */
export function usePlayerPoster(currentTime = 0): string | undefined {
  const { activeCanvas, vault } = useViewerState();

  return useMemo(() => {
    const canvas = vault.get(activeCanvas) as CanvasNormalized | undefined;
    const imageFor = (id?: string) =>
      id
        ? getPaintingResource(vault, id)?.find((body) => body.type === "Image")
            ?.id
        : undefined;
    const placeholder = imageFor(canvas?.placeholderCanvas?.id);
    const accompanying = imageFor(canvas?.accompanyingCanvas?.id);

    return currentTime === 0
      ? (placeholder ?? accompanying)
      : (accompanying ?? placeholder);
  }, [activeCanvas, currentTime, vault]);
}
