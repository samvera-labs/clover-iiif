import { CanvasEntity, getCanvasByCriteria } from "./getCanvasByCriteria";
import { Vault } from "@iiif/helpers/vault";
import { getThumbnail } from "./getThumbnail";
import { manifest } from "src/fixtures/use-iiif/get-thumbnail";
import { type Canvas } from "@iiif/presentation-3";

describe("getThumbnail()", () => {
  const vault = new Vault();

  beforeAll(async () => {
    await vault.loadManifest("", manifest);
  });

  test("returns expected thumbnail content from canvas", async () => {
    const entity: CanvasEntity = getCanvasByCriteria(
      vault,
      manifest.items[0] as Canvas,
      "painting",
      ["Image"],
    );

    const smallThumb = getThumbnail(vault, entity, 640, 537);
    expect(smallThumb).toEqual({
      id: "https://iiif.dc.library.northwestern.edu/iiif/2/44d0ad4d-6a0d-4632-82a3-b6ab8fd4e5b7/full/!300,300/0/default.jpg",
      format: "image/jpeg",
      type: "Image",
      width: 640,
      height: 537,
    });

    const bigThumb = getThumbnail(vault, entity, 9000, 6000);
    expect(bigThumb).toEqual({
      id: "https://iiif.dc.library.northwestern.edu/iiif/2/44d0ad4d-6a0d-4632-82a3-b6ab8fd4e5b7/full/!300,300/0/default.jpg",
      type: "Image",
      format: "image/jpeg",
      height: 6000,
      width: 9000,
    });
  });

  // TODO: Why can't it find the thumbnail?
  test.skip("returns an annotation thumbnail", async () => {
    const entity: CanvasEntity = getCanvasByCriteria(
      vault,
      manifest.items[1] as Canvas,
      "painting",
      ["Image"],
    );

    const thumb = getThumbnail(vault, entity, 640, 537);
    expect(thumb).toEqual({
      id: "https://iiif.dc.library.northwestern.edu/iiif/2/44d0ad4d-6a0d-4632-82a3-b6ab8fd4e5b7/full/!300,300/0/default.jpg",
      format: "image/jpeg",
      type: "Image",
      width: 640,
      height: 537,
    });
  });
});
