import { Canvas, Manifest } from "@iiif/presentation-3";
import { useEffect, useState } from "react";

import { RenderingItem } from "src/types/presentation-3";
import { useViewerState } from "src/context/viewer-context";

function extractRenderingContent(
  rendering: Manifest["rendering"] | Canvas["rendering"],
  vault: any,
) {
  const content: RenderingItem[] = [];
  if (!rendering) return content;

  for (const item of rendering) {
    if (item.id) {
      const itemContent = vault.get(item.id) as RenderingItem;
      if (itemContent) {
        content.push(itemContent);
      }
    }
  }

  return content;
}

type UseRenderingReturn = {
  root: RenderingItem[];
  canvas: RenderingItem[];
};

export default function useRendering() {
  const { activeCanvas, activeManifest, vault } = useViewerState();
  const [rendering, setRendering] = useState<UseRenderingReturn>({
    root: [],
    canvas: [],
  });

  useEffect(() => {
    const manifest = vault.get(activeManifest) as Manifest;
    const activeCanvasEntity = vault.get(activeCanvas) as Canvas;

    const rootRendering = manifest?.rendering;
    const activeCanvasRendering = activeCanvasEntity?.rendering;

    const rootContent = extractRenderingContent(rootRendering, vault);
    const canvasContent = extractRenderingContent(activeCanvasRendering, vault);

    setRendering({
      root: rootContent,
      canvas: canvasContent,
    });
  }, [activeCanvas, activeManifest, vault]);

  return { ...rendering };
}
