import { Vault } from "@hyperion-framework/vault";
import { getThumbnail } from "./getThumbnail";
import { CanvasEntity } from "./getCanvasByCriteria";
import { sampleCanvasEntityA } from "../../samples/sampleCanvasEntity";

const vault = new Vault();
vault.loadManifest("samples/sampleManifest.json");

test("Test return of thumbnail as a IIIFExternalWebResource.", () => {
  const thumbnailOnCanvas = getThumbnail(
    vault,
    sampleCanvasEntityA as CanvasEntity,
    200,
    200,
  );
  expect(thumbnailOnCanvas).toStrictEqual({
    format: undefined,
    height: 200,
    id: "https://iiif.stack.rdc.library.northwestern.edu/iiif/2/bca5b88d-7433-4710-96db-e38f1a24e9ae/full/!300,300/0/default.jpg",
    type: "ContentResource",
    width: 200,
  });
});
