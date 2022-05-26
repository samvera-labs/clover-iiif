import { IIIFExternalWebResource } from "@iiif/presentation-3";

// TODO: Fix this type when fixing tests
function getUrl(obj: any) {
  // No IIIF image service, just return vague id value
  if (!obj.service) {
    return obj.id;
  }
  // Construct a IIIF Image service url path with params
  return `${obj.service[0].id}/full/,${obj.height || 500}/0/default.jpg`;
}

// TODO: Fix this type when fixing all tests
export const getAccompanyingCanvasImage = (
  accompanyingCanvas: any | undefined,
): string | undefined => {
  if (!accompanyingCanvas) return;
  try {
    /**
     * Step 1: does a thumbnail item exist on canvas root?
     */
    const thumbnail: Array<IIIFExternalWebResource> | undefined =
      accompanyingCanvas.thumbnail;
    if (thumbnail && thumbnail.length > 0) {
      return getUrl(thumbnail[0]);
    }

    /**
     * Step 2: Dig into the Annotation Page > Body
     */

    return getUrl(accompanyingCanvas.items[0].items[0].body);
  } catch (e) {
    console.error("Error retrieving accompanying canvas image", e);
    return;
  }
};
