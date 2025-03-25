import {
  IIIFExternalWebResource,
  ManifestNormalized,
  Reference,
} from "@iiif/presentation-3";

import { getVisibleCanvasesFromCanvasId } from "@iiif/helpers";

export const getCanvasResources = (
  vault: any,
  manifest: ManifestNormalized,
  activeCanvas: string,
  sequence: [Reference<"Canvas">[], number[][]],
): IIIFExternalWebResource[] | undefined => {
  // @ts-ignore
  const data = getVisibleCanvasesFromCanvasId(vault, manifest, activeCanvas);
  console.log({ data });
  return;
};
