import {
  manifestNoAnnotations,
  vttManifest,
} from "src/fixtures/use-iiif/get-supplementing-resources";

import { Vault } from "@iiif/vault";
import { getSupplementingResources } from "./getSupplementingResources";

describe("getSupplementingResources", () => {
  test("returns an empty array if there are no annotations", async () => {
    const vault = new Vault();
    await vault.loadManifest("", manifestNoAnnotations);

    const result = getSupplementingResources(
      vault,
      "https://api.dc.library.northwestern.edu/api/v2/works/57446da0-dc8b-4be6-998d-efb67c71f654?as=iiif/canvas/access/0",
      "text/vtt",
    );

    expect(result).toHaveLength(0);
  });

  test("returns an empty array if annotations is not an array in annotations page", async () => {
    const vault = new Vault();
    const badAnnotationItems = {
      id: "https://iiif.stack.rdc-staging.library.northwestern.edu/public/iiif3/9d/67/f8/c5/-1/a2/e-/4f/bd/-8/47/1-/4a/1a/fa/7d/6e/5a-manifest.json",
      items: [
        {
          annotations: [
            {
              id: "https://iiif.stack.rdc-staging.library.northwestern.edu/public/iiif3/9d/67/f8/c5/-1/a2/e-/4f/bd/-8/47/1-/4a/1a/fa/7d/6e/5a-manifest.json/canvas/ca6a621f-d3dd-43b2-8aed-40fdfda4c024/annotation_page/a1",
              items: "",
              type: "AnnotationPage",
            },
          ],
          duration: 30.0,
          height: 480,
          id: "https://iiif.stack.rdc-staging.library.northwestern.edu/public/iiif3/9d/67/f8/c5/-1/a2/e-/4f/bd/-8/47/1-/4a/1a/fa/7d/6e/5a-manifest.json/canvas/ca6a621f-d3dd-43b2-8aed-40fdfda4c024",
          items: [],
          label: {
            en: ["access mov"],
          },
          type: "Canvas",
          width: 640,
        },
      ],
      label: {
        en: ["Canary Record TEST 2"],
      },
      type: "Manifest",
      "@context": "http://iiif.io/api/presentation/3/context.json",
    };
    await vault.loadManifest("", badAnnotationItems);

    const result = getSupplementingResources(
      vault,
      "https://iiif.stack.rdc-staging.library.northwestern.edu/public/iiif3/9d/67/f8/c5/-1/a2/e-/4f/bd/-8/47/1-/4a/1a/fa/7d/6e/5a-manifest.json/canvas/ca6a621f-d3dd-43b2-8aed-40fdfda4c024",
      "text/vtt",
    );

    expect(result).toHaveLength(0);
  });

  test("returns a filtered list of annotation bodies", async () => {
    const vault = new Vault();
    await vault.loadManifest("", vttManifest);

    const result = getSupplementingResources(
      vault,
      "https://iiif.stack.rdc-staging.library.northwestern.edu/public/iiif3/9d/67/f8/c5/-1/a2/e-/4f/bd/-8/47/1-/4a/1a/fa/7d/6e/5a-manifest.json/canvas/ca6a621f-d3dd-43b2-8aed-40fdfda4c024",
      "text/vtt",
    );

    expect(result).toHaveLength(1);
    expect(result[0].id).toBe(
      "https://iiif.stack.rdc-staging.library.northwestern.edu/public/vtt/ca/6a/62/1f/-d/3d/d-/43/b2/-8/ae/d-/40/fd/fd/a4/c0/24/ca6a621f-d3dd-43b2-8aed-40fdfda4c024.vtt",
    );
  });
});
