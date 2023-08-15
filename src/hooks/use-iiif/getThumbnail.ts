import { IIIFExternalWebResource } from "@iiif/presentation-3";
import { CanvasEntity } from "src/hooks/use-iiif/getCanvasByCriteria";

export const getThumbnail = (
  vault: any,
  entity: CanvasEntity,
  width: number,
  height: number
) => {
  /*
   * 1. Initiate empty candidates array.
   */
  let candidates: Array<IIIFExternalWebResource> = [];

  /*
   * 2. Check if canvas has an explicitly assigned IIIF thumbnail.
   */
  if (entity.canvas)
    if (entity.canvas.thumbnail.length > 0) {
      const canvasThumbnail: IIIFExternalWebResource = vault.get(
        entity.canvas.thumbnail[0]
      );
      candidates.push(canvasThumbnail);
    }

  if (entity.annotations[0]) {
    /*
     * 2. Check if painting annotation has an explicitly assigned IIIF thumbnail.
     */
    if (entity.annotations[0].thumbnail)
      if (entity.annotations[0].thumbnail.length > 0) {
        const annotationThumbnail: IIIFExternalWebResource = vault.get(
          entity.annotations[0].thumbnail[0]
        );
        candidates.push(annotationThumbnail);
      }

    /*
     * 3. Check if painting annotation is of type Image.
     */
    if (!entity.annotations[0].body) return;
    const annotationBody = entity.annotations[0]
      .body as IIIFExternalWebResource;

    if (annotationBody.type === "Image") candidates.push(annotationBody);
  }

  /*
   * 4. Validate candidates and make selection.
   */
  if (candidates.length === 0) return;

  const selectedCandidate: IIIFExternalWebResource = {
    id: candidates[0].id,
    format: candidates[0].format,
    type: candidates[0].type,
    width: width,
    height: height,
  };

  /*
   * 5. Return (for time being crudely) constructed image object.
   */
  const thumbnailContent = selectedCandidate;
  //console.log("thumbnailContent", thumbnailContent);

  return thumbnailContent;
};
