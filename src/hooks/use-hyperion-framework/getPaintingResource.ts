import { IIIFExternalWebResource } from "@hyperion-framework/types";
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

  if (canvasEntity.annotations[0]) {
    const resources: IIIFExternalWebResource[] = vault.allFromRef(
      canvasEntity.annotations[0].body,
    );

    return resources[0];
  }

  return;
};
