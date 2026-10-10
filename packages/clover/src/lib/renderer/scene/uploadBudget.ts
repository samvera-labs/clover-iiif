import type { LoadedImage } from "../io/decode";

/**
 * Decoded bytes of new tiles uploaded to the GPU in one frame, beyond the first tile:
 * about two 512 px tiles. A burst of arrivals otherwise lands in a single frame (uploads
 * and mipmaps run on the main thread), which on a slow CPU costs tens of milliseconds.
 * The rest wait a frame each, drawn meanwhile from the coarser level beneath.
 */
export const UPLOAD_BUDGET_BYTES = 2 * 1024 * 1024;

export interface UploadBudget {
  /** The cache as the planner should see it this frame. */
  getTile: (url: string) => LoadedImage | undefined;
  /** True once a tile has been held back: the frame loop should run again. */
  readonly deferred: boolean;
}

/**
 * One frame's view of the tile cache: a decoded tile counts as present only once the
 * backend holds it (`isResident`) or this frame's upload budget can take it.
 *
 * A tile held back reads as missing, so the planner paints the coarser level beneath
 * it — a softer patch for a frame, never a hole. Video and pixels shown as DOM layers
 * are never held back: they are not uploaded, or must be every frame.
 */
export function uploadBudget(
  getTile: (url: string) => LoadedImage | undefined,
  isResident: (url: string) => boolean,
  bytes = UPLOAD_BUDGET_BYTES,
): UploadBudget {
  const admitted = new Set<string>();
  let remaining = bytes;
  let deferred = false;
  return {
    get deferred() {
      return deferred;
    },
    getTile(url) {
      const image = getTile(url);
      if (
        !image ||
        image.kind === "media" ||
        image.opaque ||
        admitted.has(url) ||
        isResident(url)
      ) {
        return image;
      }
      const size = image.width * image.height * 4;
      // Always at least one, so a single image larger than the budget still shows.
      if (admitted.size > 0 && size > remaining) {
        deferred = true;
        return undefined;
      }
      remaining -= size;
      admitted.add(url);
      return image;
    },
  };
}
