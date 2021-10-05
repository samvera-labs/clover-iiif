import { getCanvasByCriteria } from "services/iiif";
import { IIIFExternalWebResource } from "@hyperion-framework/types";

export default function useVaultHelpers(vault: any) {
  const getCanvasPainting = (
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

  return {
    getCanvasPainting,
  };
}
