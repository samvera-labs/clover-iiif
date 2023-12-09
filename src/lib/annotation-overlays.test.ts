import { formatXywhCoordinates } from "./annotation-overlays";
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
