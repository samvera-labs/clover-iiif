import { getCanvasByCriteria } from "services/iiif";

export default function useVaultHelpers(vault: any) {
  const getCanvasPainting = (id: string) => {
    const canvasEntity = getCanvasByCriteria(
      vault,
      { id, type: "Canvas" },
      "painting",
      ["Image", "Sound", "Video"],
    );

    if (canvasEntity.annotations.length === 0) return;

    return canvasEntity.annotations[0]?.body[0];
  };

  return {
    getCanvasPainting,
  };
}
