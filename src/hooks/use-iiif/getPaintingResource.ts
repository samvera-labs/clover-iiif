import { IIIFExternalWebResource } from "@iiif/presentation-3";
import { getCanvasByCriteria } from "src/hooks/use-iiif";

export const getPaintingResource = (
  vault: any,
  id: string,
): IIIFExternalWebResource[] | undefined => {
  const canvasEntity = getCanvasByCriteria(
    vault,
    { id, type: "Canvas" },
    "painting",
    ["Image", "Sound", "Video"],
  );

  if (canvasEntity.annotations.length === 0) return;

  if (canvasEntity.annotations && canvasEntity.annotations)
    return canvasEntity.annotations.map(
      (item) => item?.body,
    ) as IIIFExternalWebResource[];

  return;
};
