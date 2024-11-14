import {
  manifest,
  manifestNoAnnotations,
} from "src/fixtures/use-iiif/get-painting-resource";

import { Vault } from "@iiif/helpers/vault";
import { getPaintingResource } from "./getPaintingResource";

describe("getPaintingResource()", () => {
  test("should return the painting resource annotation", async () => {
    const vault = new Vault();
    await vault.loadManifest("", manifest);

    const result = getPaintingResource(
      vault,
      "https://test.org/works/ad25d4af-8a12-4d8f-a557-79aea012e081?as=iiif/canvas/access/0",
    );
    const expected = [
      {
        format: "image/tiff",
        height: 2580,
        id: "https://iiif.dc.library.northwestern.edu/iiif/2/4eb5a0d0-1908-42a8-a5f2-1ce88e25928c/full/600,/0/default.jpg",
        "iiif-parser:hasPart": [
          {
            id: "https://iiif.dc.library.northwestern.edu/iiif/2/4eb5a0d0-1908-42a8-a5f2-1ce88e25928c/full/600,/0/default.jpg",
            "iiif-parser:partOf":
              "https://test.org/works/ad25d4af-8a12-4d8f-a557-79aea012e081?as=iiif/canvas/access/0/annotation/0",
            type: "Image",
          },
        ],
        service: [
          {
            "@id":
              "https://iiif.dc.library.northwestern.edu/iiif/2/4eb5a0d0-1908-42a8-a5f2-1ce88e25928c",
            "@type": "ImageService2",
            profile: "http://iiif.io/api/image/2/level2.json",
          },
        ],
        type: "Image",
        width: 3072,
      },
    ];
    expect(result).toEqual(expected);
  });

  test("should return undefined if there are no annotations", async () => {
    const vault = new Vault();
    await vault.loadManifest("", manifestNoAnnotations);

    const result = getPaintingResource(
      vault,
      "https://api.dc.library.northwestern.edu/api/v2/works/57446da0-dc8b-4be6-998d-efb67c71f654?as=iiif/canvas/access/0",
    );
    expect(result).toBeUndefined();
  });
});
