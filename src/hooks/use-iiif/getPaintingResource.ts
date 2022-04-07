import { IIIFExternalWebResource } from "@iiif/presentation-3";
import { getCanvasByCriteria } from "./index";

export const getPaintingResource = (
  vault: any,
  id: string,
): IIIFExternalWebResource | undefined => {
  const canvasEntity = getCanvasByCriteria(
    vault,
    { id, type: "Canvas" },
    "painting",
    ["Image", "Sound", "Video"],
  );

  if (canvasEntity.annotations.length === 0) return;

  if (canvasEntity.annotations[0] && canvasEntity.annotations[0].body)
    return canvasEntity.annotations[0].body as IIIFExternalWebResource;

  return;
};
