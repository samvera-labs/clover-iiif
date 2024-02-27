import {
  parseAnnotationTarget,
  AnnotationTargetExtended,
  parseAnnotationsFromAnnotationResources,
} from "./annotation-helpers";
import { Vault } from "@iiif/vault";
import {
  simpleTagging,
  multiplePages,
} from "src/fixtures/use-iiif/get-annotation-resources";

import { getAnnotationResources } from "src/hooks/use-iiif/getAnnotationResources";

describe("parseAnnotationTarget", () => {
  it("handles target strings with xywh", () => {
    const target = "http://example.com/canvas/1#xywh=100,200,300,400";

    const result = parseAnnotationTarget(target);

    const expected = {
      id: "http://example.com/canvas/1",
      rect: {
        x: 100,
        y: 200,
        w: 300,
        h: 400,
      },
    };
    expect(result).toEqual(expected);
  });

  it("handles target strings with t", () => {
    const target = "http://example.com/canvas/1#t=100";

    const result = parseAnnotationTarget(target);

    const expected = {
      id: "http://example.com/canvas/1",
      t: "100",
    };
    expect(result).toEqual(expected);
  });

  it("handles target objects with PointSelector", () => {
    const target: AnnotationTargetExtended = {
      type: "SpecificResource",
      source: "http://example.com/canvas/1",
      selector: {
        type: "PointSelector",
        x: 100,
        y: 200,
      },
    };

    const result = parseAnnotationTarget(target);

    const expected = {
      id: "http://example.com/canvas/1",
      point: {
        x: 100,
        y: 200,
      },
    };
    expect(result).toEqual(expected);
  });

  it("handles target objects with SvgSelector", () => {
    const target: AnnotationTargetExtended = {
      type: "SpecificResource",
      source: "http://example.com/canvas/1",
      selector: {
        type: "SvgSelector",
        value:
          '<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg"><circle cx="50" cy="50" r="50" /></svg>',
      },
    };

    const result = parseAnnotationTarget(target);

    const expected = {
      id: "http://example.com/canvas/1",
      svg: '<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg"><circle cx="50" cy="50" r="50" /></svg>',
    };
    expect(result).toEqual(expected);
  });

  it("handles target objects with FragmentSelector and xywh", () => {
    const target: AnnotationTargetExtended = {
      type: "SpecificResource",
      source: {
        id: "http://example.com/canvas/1",
        type: "Canvas",
        partOf: [
          {
            id: "http://example.com/manifest.json",
            type: "Manifest",
          },
        ],
      },
      selector: {
        conformsTo: "http://www.w3.org/TR/media-frags/",
        type: "FragmentSelector",
        value: "xywh=100,200,300,400",
      },
    };

    const result = parseAnnotationTarget(target);

    const expected = {
      id: "http://example.com/canvas/1",
      rect: {
        x: 100,
        y: 200,
        w: 300,
        h: 400,
      },
    };
    expect(result).toEqual(expected);
  });
});

describe("parseAnnotationsFromAnnotationResources", () => {
  it("returns annotations from annotation resource", async () => {
    const config = {};
    const vault = new Vault();
    await vault.loadManifest("", structuredClone(simpleTagging));
    const annotationResources = await getAnnotationResources(
      vault,
      simpleTagging.items[0].id,
    );

    const res = parseAnnotationsFromAnnotationResources(
      annotationResources,
      vault,
      config,
    );

    const expected = [
      {
        body: [
          {
            id: "vault://605b9d93",
            type: "ContentResource",
          },
        ],
        id: "https://iiif.io/api/cookbook/recipe/0021-tagging/annotation/p0002-tag",
        motivation: ["tagging"],
        target:
          "https://iiif.io/api/cookbook/recipe/0021-tagging/canvas/p1#xywh=265,661,1260,1239",
        type: "Annotation",
      },
    ];
    expect(res).toStrictEqual(expected);
  });

  it("returns annotations if annotation resource has multiple annotation pages", async () => {
    const config = {};
    const vault = new Vault();
    await vault.loadManifest("", structuredClone(multiplePages));
    const annotationResources = await getAnnotationResources(
      vault,
      multiplePages.items[0].id,
    );

    const res = parseAnnotationsFromAnnotationResources(
      annotationResources,
      vault,
      config,
    );

    const expected = [
      {
        body: [
          {
            id: "vault://772e4338",
            type: "ContentResource",
          },
        ],
        id: "http://localhost:3000/manifest/newspaper/newspaper_issue_1-anno_p1.json-1",
        motivation: ["highlighting"],
        target:
          "http://localhost:3000/manifest/newspaper/canvas/i1p1#xywh=839,3259,118,27",
        type: "Annotation",
      },
      {
        body: [
          {
            id: "vault://772e4338",
            type: "ContentResource",
          },
        ],
        id: "http://localhost:3000/manifest/newspaper/newspaper_issue_1-anno_p2.json-2",
        motivation: ["commenting"],
        target:
          "http://localhost:3000/manifest/newspaper/canvas/i1p2#xywh=161,459,1063,329",
        type: "Annotation",
      },
    ];
    expect(res).toStrictEqual(expected);
  });

  it("ignores annotations in ignoreAnnotationOverlaysLabels", async () => {
    const config = { ignoreAnnotationOverlaysLabels: ["Clippings"] };
    const vault = new Vault();
    await vault.loadManifest("", structuredClone(multiplePages));
    const annotationResources = await getAnnotationResources(
      vault,
      multiplePages.items[0].id,
    );

    const res = parseAnnotationsFromAnnotationResources(
      annotationResources,
      vault,
      config,
    );

    const expected = [
      {
        body: [
          {
            id: "vault://772e4338",
            type: "ContentResource",
          },
        ],
        id: "http://localhost:3000/manifest/newspaper/newspaper_issue_1-anno_p1.json-1",
        motivation: ["highlighting"],
        target:
          "http://localhost:3000/manifest/newspaper/canvas/i1p1#xywh=839,3259,118,27",
        type: "Annotation",
      },
    ];
    expect(res).toStrictEqual(expected);
  });

  it("returns empty array if annotation resource is empty array", () => {
    const config = {};
    const annotationResources = [];
    const vault = new Vault();

    const res = parseAnnotationsFromAnnotationResources(
      annotationResources,
      vault,
      config,
    );

    expect(res).toStrictEqual([]);
  });
});

/*
{
selector :{
conformsTo:"http://www.w3.org/TR/media-frags/",
type:"FragmentSelector",
value:"xywh=86.18675994873047,1189.02587890625,910.7970657348633,653.7779541015625"
}
source:"https://iiif.io/api/image/3.0/example/reference/4ce82cef49fb16798f4c2440307c3d6f-newspaper-p1"
type:"SpecificResource"
}
*/
