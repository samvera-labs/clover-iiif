import {
  formatXywhCoordinates,
  formatPointSelectors,
} from "./annotation-overlays";
import { LabeledAnnotationedResource } from "src/hooks/use-iiif/getAnnotationResources";

describe("formatXywhCoordinates method", () => {
  it("takes the xywh data from target string and returns and array of numbers", () => {
    const annotations: LabeledAnnotationedResource[] = [
      {
        id: "Search results",
        label: {
          en: ["Search results"],
        },
        motivation: "highlighting",
        items: [
          {
            target: "https://example.com/1#xywh=100,101,102,103",
            id: "1",
            type: "TextualBody",
            format: "text/plain",
            language: "en",
            value: "cat",
          },
          {
            target: "https://example.com/2#xywh=200,201,202,203",
            id: "2",
            type: "TextualBody",
            format: "text/plain",
            language: "en",
            value: "Cat,",
          },
        ],
      },
    ];

    const results = formatXywhCoordinates(annotations);

    expect(results).toStrictEqual([
      [100, 101, 102, 103],
      [200, 201, 202, 203],
    ]);
  });

  it("ignores target strings without xywh", () => {
    const annotations: LabeledAnnotationedResource[] = [
      {
        id: "Search results",
        label: {
          en: ["Search results"],
        },
        motivation: "highlighting",
        items: [
          {
            target: "https://example.com/1#xywh=100,101,102,103",
            id: "1",
            type: "TextualBody",
            format: "text/plain",
            language: "en",
            value: "cat",
          },
          {
            target: "https://example.com/2",
            id: "2",
            type: "TextualBody",
            format: "text/plain",
            language: "en",
            value: "Cat,",
          },
        ],
      },
    ];

    const results = formatXywhCoordinates(annotations);

    expect(results).toStrictEqual([[100, 101, 102, 103]]);
  });

  it("ignores target when it is an object", () => {
    const annotations: LabeledAnnotationedResource[] = [
      {
        id: "Search results",
        label: {
          en: ["Search results"],
        },
        motivation: "highlighting",
        items: [
          {
            target: "https://example.com/1#xywh=100,101,102,103",
            id: "1",
            type: "TextualBody",
            format: "text/plain",
            language: "en",
            value: "cat",
          },
          {
            target: {
              type: "SpecificResource",
              source: "https://example.com/canvas.json",
              selector: {
                type: "PointSelector",
                x: 200,
                y: 201,
              },
            },
            id: "2",
            type: "TextualBody",
            format: "text/plain",
            language: "en",
            value: "Cat,",
          },
        ],
      },
    ];

    const results = formatXywhCoordinates(annotations);

    expect(results).toStrictEqual([[100, 101, 102, 103]]);
  });

  it("returns empty array if no target strings have xywh", () => {
    const annotations: LabeledAnnotationedResource[] = [
      {
        id: "Search results",
        label: {
          en: ["Search results"],
        },
        motivation: "highlighting",
        items: [
          {
            target: "https://example.com/1",
            id: "1",
            type: "TextualBody",
            format: "text/plain",
            language: "en",
            value: "cat",
          },
          {
            target: "https://example.com/2",
            id: "2",
            type: "TextualBody",
            format: "text/plain",
            language: "en",
            value: "Cat,",
          },
        ],
      },
    ];

    const results = formatXywhCoordinates(annotations);

    expect(results).toStrictEqual([]);
  });
});

describe("formatPointSelectors method", () => {
  it("takes the PointSelectors data from target and returns and array of numbers", () => {
    const annotations: LabeledAnnotationedResource[] = [
      {
        id: "Search results",
        label: {
          en: ["Search results"],
        },
        motivation: "highlighting",
        items: [
          {
            target: {
              type: "SpecificResource",
              source:
                "https://iiif.io/api/cookbook/recipe/0135-annotating-point-in-canvas/canvas.json",
              selector: {
                type: "PointSelector",
                x: 100,
                y: 101,
              },
            },
            id: "1",
            type: "TextualBody",
            format: "text/plain",
            language: "en",
            value: "cat",
          },
          {
            target: {
              type: "SpecificResource",
              source:
                "https://iiif.io/api/cookbook/recipe/0135-annotating-point-in-canvas/canvas.json",
              selector: {
                type: "PointSelector",
                x: 200,
                y: 201,
              },
            },
            id: "2",
            type: "TextualBody",
            format: "text/plain",
            language: "en",
            value: "Cat,",
          },
        ],
      },
    ];

    const results = formatPointSelectors(annotations);

    expect(results).toStrictEqual([
      [100, 101],
      [200, 201],
    ]);
  });

  it("ignores string targets", () => {
    const annotations: LabeledAnnotationedResource[] = [
      {
        id: "Search results",
        label: {
          en: ["Search results"],
        },
        motivation: "highlighting",
        items: [
          {
            target: {
              type: "SpecificResource",
              source:
                "https://iiif.io/api/cookbook/recipe/0135-annotating-point-in-canvas/canvas.json",
              selector: {
                type: "PointSelector",
                x: 100,
                y: 101,
              },
            },
            id: "1",
            type: "TextualBody",
            format: "text/plain",
            language: "en",
            value: "cat",
          },
          {
            target: "https://example.com/2#xywh=200,201,202,203",

            id: "2",
            type: "TextualBody",
            format: "text/plain",
            language: "en",
            value: "Cat,",
          },
        ],
      },
    ];

    const results = formatPointSelectors(annotations);

    expect(results).toStrictEqual([[100, 101]]);
  });

  it("returns empty array if no target are PointSelectors", () => {
    const annotations: LabeledAnnotationedResource[] = [
      {
        id: "Search results",
        label: {
          en: ["Search results"],
        },
        motivation: "highlighting",
        items: [
          {
            target: "https://example.com/1#xywh=100,101,102,103",
            id: "1",
            type: "TextualBody",
            format: "text/plain",
            language: "en",
            value: "cat",
          },
          {
            target: "https://example.com/2#xywh=200,201,202,203",
            id: "2",
            type: "TextualBody",
            format: "text/plain",
            language: "en",
            value: "Cat,",
          },
        ],
      },
    ];

    const results = formatPointSelectors(annotations);

    expect(results).toStrictEqual([]);
  });
});
