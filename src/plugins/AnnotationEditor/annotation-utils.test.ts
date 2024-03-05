import {
  saveAnnotation,
  deleteAnnotation,
  updateAnnotation,
  fetchAnnotations,
  convertWebAnnotation,
} from "./annotation-utils";

const webAnnotation1 = {
  "@context": "http://www.w3.org/ns/anno.jsonld",
  type: "Annotation",
  body: [{ type: "TextualBody", value: "first", purpose: "commenting" }],
  target: {
    source: "http://example.com/1",
    selector: {
      type: "FragmentSelector",
      conformsTo: "http://www.w3.org/TR/media-frags/",
      value: "xywh=pixel:10,20,30,40",
    },
  },
  id: "123abc",
};

const annotation1 = (manifest, canvas) => {
  return {
    type: "Annotation",
    body: { type: "TextualBody", value: "first", format: "text/plain" },
    motivation: "commenting",
    target: {
      type: "SpecificResource",
      source: {
        id: canvas,
        type: "Canvas",
        partOf: [
          {
            id: manifest,
            type: "Manifest",
          },
        ],
      },
      selector: {
        type: "FragmentSelector",
        conformsTo: "http://www.w3.org/TR/media-frags/",
        value: "xywh=10,20,30,40",
      },
    },
    id: "123abc",
  };
};

const webAnnotation2 = {
  "@context": "http://www.w3.org/ns/anno.jsonld",
  type: "Annotation",
  body: [{ type: "TextualBody", value: "second", purpose: "commenting" }],
  target: {
    source: "http://example.com/2",
    selector: {
      type: "FragmentSelector",
      conformsTo: "http://www.w3.org/TR/media-frags/",
      value: "xywh=pixel:15,25,35,45",
    },
  },
  id: "456def",
};
const annotation2 = (manifest, canvas) => {
  return {
    type: "Annotation",
    body: { type: "TextualBody", value: "second", format: "text/plain" },
    motivation: "commenting",
    target: {
      type: "SpecificResource",
      source: {
        id: canvas,
        type: "Canvas",
        partOf: [
          {
            id: manifest,
            type: "Manifest",
          },
        ],
      },
      selector: {
        type: "FragmentSelector",
        conformsTo: "http://www.w3.org/TR/media-frags/",
        value: "xywh=15,25,35,45",
      },
    },
    id: "456def",
  };
};

const webAnnotationMultipleBodies = {
  "@context": "http://www.w3.org/ns/anno.jsonld",
  type: "Annotation",
  body: [
    { type: "TextualBody", value: "second b", purpose: "commenting" },
    { type: "TextualBody", value: "second c", purpose: "commenting" },
  ],
  target: {
    source: "http://example.com/1",
    selector: {
      type: "FragmentSelector",
      conformsTo: "http://www.w3.org/TR/media-frags/",
      value: "xywh=pixel:10,20,30,40",
    },
  },
  id: "123abc",
};

const annotationMultipleBodies = (manifest, canvas) => {
  return {
    type: "Annotation",
    body: [
      { type: "TextualBody", value: "second b", format: "text/plain" },
      { type: "TextualBody", value: "second c", format: "text/plain" },
    ],
    motivation: "commenting",
    target: {
      type: "SpecificResource",
      source: {
        id: canvas,
        type: "Canvas",
        partOf: [
          {
            id: manifest,
            type: "Manifest",
          },
        ],
      },
      selector: {
        type: "FragmentSelector",
        conformsTo: "http://www.w3.org/TR/media-frags/",
        value: "xywh=10,20,30,40",
      },
    },
    id: "123abc",
  };
};

const unit = "pixel";

describe("saveAnnotation with guest user", () => {
  afterEach(() => {
    localStorage.clear();
  });

  it("saves annotation when there are no saved annotation", () => {
    const canvas = "canvas1";
    const manifest = "manifest";

    saveAnnotation(webAnnotation1, manifest, canvas, unit);
    const res = localStorage.getItem("annotations");

    const expected = JSON.stringify({
      [canvas]: {
        id: canvas,
        items: [annotation1(manifest, canvas)],
        type: "AnnotationPage",
      },
    });

    expect(res).toStrictEqual(expected);
  });

  it("saves annotation when there are saved annotation", () => {
    const canvas = "canvas1";
    const manifest = "manifest";
    localStorage.setItem(
      "annotations",
      JSON.stringify({
        [canvas]: {
          id: canvas,
          items: [annotation1(manifest, canvas)],
          type: "AnnotationPage",
        },
      }),
    );

    saveAnnotation(webAnnotation2, manifest, canvas, unit);
    const res = localStorage.getItem("annotations");

    const expected = JSON.stringify({
      [canvas]: {
        id: canvas,
        items: [annotation1(manifest, canvas), annotation2(manifest, canvas)],
        type: "AnnotationPage",
      },
    });

    expect(res).toStrictEqual(expected);
  });

  it("saves annotation when there are saved annotation with multiple canvas", () => {
    const canvas1 = "canvas1";
    const canvas2 = "canvas2";
    const manifest = "manifest";

    localStorage.setItem(
      "annotations",
      JSON.stringify({
        [canvas1]: {
          id: canvas1,
          items: [annotation1(manifest, canvas1)],
          type: "AnnotationPage",
        },
      }),
    );

    saveAnnotation(webAnnotation2, manifest, canvas2, unit);
    const res = localStorage.getItem("annotations");

    const expected = JSON.stringify({
      [canvas1]: {
        id: canvas1,
        items: [annotation1(manifest, canvas1)],
        type: "AnnotationPage",
      },
      [canvas2]: {
        id: canvas2,
        items: [annotation2(manifest, canvas2)],
        type: "AnnotationPage",
      },
    });

    expect(res).toStrictEqual(expected);
  });

  it("saves annotation with multiple bodies", () => {
    const canvas = "canvas1";
    const manifest = "manifest";

    saveAnnotation(webAnnotationMultipleBodies, manifest, canvas, unit);
    const res = localStorage.getItem("annotations");

    const expected = JSON.stringify({
      [canvas]: {
        id: canvas,
        items: [annotationMultipleBodies(manifest, canvas)],
        type: "AnnotationPage",
      },
    });

    expect(res).toStrictEqual(expected);
  });
});

describe("deleteAnnotation with guest user", () => {
  afterEach(() => {
    localStorage.clear();
  });

  it("deletes annotation when there is one annotation", () => {
    const canvas = "canvas1";
    const manifest = "manifest";

    localStorage.setItem(
      "annotations",
      JSON.stringify({
        [canvas]: {
          id: canvas,
          items: [annotation1(manifest, canvas)],
          type: "AnnotationPage",
        },
      }),
    );

    deleteAnnotation(webAnnotation1, manifest, canvas, unit);
    const res = localStorage.getItem("annotations");

    const expected = JSON.stringify({
      [canvas]: { id: canvas, items: [], type: "AnnotationPage" },
    });

    expect(res).toStrictEqual(expected);
  });

  it("deletes annotation when there are multiple annotations", () => {
    const canvas = "canvas1";
    const manifest = "manifest";

    localStorage.setItem(
      "annotations",
      JSON.stringify({
        [canvas]: {
          id: canvas,
          items: [annotation1(manifest, canvas), annotation2(manifest, canvas)],
          type: "AnnotationPage",
        },
      }),
    );

    deleteAnnotation(webAnnotation1, manifest, canvas, unit);
    const res = localStorage.getItem("annotations");

    const expected = JSON.stringify({
      [canvas]: {
        id: canvas,
        items: [annotation2(manifest, canvas)],
        type: "AnnotationPage",
      },
    });

    expect(res).toStrictEqual(expected);
  });

  it("deletes annotation when multiple canvases", () => {
    const canvas = "canvas1";
    const canvas2 = "canvas2";
    const manifest = "manifest";

    localStorage.setItem(
      "annotations",
      JSON.stringify({
        [canvas]: {
          id: canvas,
          items: [annotation1(manifest, canvas)],
          type: "AnnotationPage",
        },
        [canvas2]: {
          id: canvas2,
          items: [annotation2(manifest, canvas2)],
          type: "AnnotationPage",
        },
      }),
    );

    deleteAnnotation(webAnnotation2, manifest, canvas2, unit);
    const res = localStorage.getItem("annotations");

    const expected = JSON.stringify({
      [canvas]: {
        id: canvas,
        items: [annotation1(manifest, canvas)],
        type: "AnnotationPage",
      },
      [canvas2]: {
        id: canvas2,
        items: [],
        type: "AnnotationPage",
      },
    });

    expect(res).toStrictEqual(expected);
  });

  it("does nothing if canvas for annotation does not match saved annotations", () => {
    const canvas = "canvas1";
    const canvas2 = "canvas2";
    const manifest = "manifest";

    localStorage.setItem(
      "annotations",
      JSON.stringify({
        [canvas]: {
          id: canvas,
          items: [annotation1(manifest, canvas)],
          type: "AnnotationPage",
        },
        [canvas2]: {
          id: canvas2,
          items: [annotation2(manifest, canvas2)],
          type: "AnnotationPage",
        },
      }),
    );

    deleteAnnotation(webAnnotation2, manifest, canvas, unit);
    const res = localStorage.getItem("annotations");

    const expected = JSON.stringify({
      [canvas]: {
        id: canvas,
        items: [annotation1(manifest, canvas)],
        type: "AnnotationPage",
      },
      [canvas2]: {
        id: canvas2,
        items: [annotation2(manifest, canvas2)],
        type: "AnnotationPage",
      },
    });

    expect(res).toStrictEqual(expected);
  });
});

describe("updateAnnotation with guest user", () => {
  afterEach(() => {
    localStorage.clear();
  });

  it("updates annotation when there is one annotation", () => {
    const canvas = "canvas1";
    const manifest = "manifest";
    localStorage.setItem(
      "annotations",
      JSON.stringify({
        [canvas]: {
          id: canvas,
          items: [annotation1(manifest, canvas)],
          type: "AnnotationPage",
        },
      }),
    );
    const webAnnotation = {
      "@context": "http://www.w3.org/ns/anno.jsonld",
      type: "Annotation",
      body: [{ type: "TextualBody", value: "updated", purpose: "commenting" }],
      target: {
        source: "http://example.com/1",
        selector: {
          type: "FragmentSelector",
          conformsTo: "http://www.w3.org/TR/media-frags/",
          value: "xywh=100,200,300,400",
        },
      },
      id: "123abc",
    };

    updateAnnotation(webAnnotation, manifest, canvas, unit);
    const res = localStorage.getItem("annotations");

    const expected = JSON.stringify({
      [canvas]: {
        id: canvas,
        items: [
          {
            type: "Annotation",
            body: {
              type: "TextualBody",
              value: "updated",
              format: "text/plain",
            },
            motivation: "commenting",
            target: {
              type: "SpecificResource",
              source: {
                id: canvas,
                type: "Canvas",
                partOf: [
                  {
                    id: manifest,
                    type: "Manifest",
                  },
                ],
              },
              selector: {
                type: "FragmentSelector",
                conformsTo: "http://www.w3.org/TR/media-frags/",
                value: "xywh=100,200,300,400",
              },
            },
            id: "123abc",
          },
        ],
        type: "AnnotationPage",
      },
    });

    expect(res).toStrictEqual(expected);
  });

  it("updates annotation when there are multiple annotations", () => {
    const canvas = "canvas1";
    const manifest = "manifest";

    localStorage.setItem(
      "annotations",
      JSON.stringify({
        [canvas]: {
          id: canvas,
          items: [annotation1(manifest, canvas), annotation2(manifest, canvas)],
          type: "AnnotationPage",
        },
      }),
    );
    const webAnnotation = {
      ...webAnnotation1,
      body: [{ type: "TextualBody", value: "updated", purpose: "commenting" }],
    };

    updateAnnotation(webAnnotation, manifest, canvas, unit);
    const res = localStorage.getItem("annotations");

    const expected = JSON.stringify({
      [canvas]: {
        id: canvas,
        items: [
          {
            ...annotation1(manifest, canvas),
            body: {
              type: "TextualBody",
              value: "updated",
              format: "text/plain",
            },
          },
          annotation2(manifest, canvas),
        ],
        type: "AnnotationPage",
      },
    });

    expect(res).toStrictEqual(expected);
  });

  it("does nothing if canvas for annotation does not match saved annotations", () => {
    const canvas = "canvas1";
    const canvas2 = "canvas2";
    const manifest = "manifest";

    localStorage.setItem(
      "annotations",
      JSON.stringify({
        [canvas]: {
          id: canvas,
          items: [annotation1(manifest, canvas)],
          type: "AnnotationPage",
        },
        [canvas2]: {
          id: canvas2,
          items: [annotation2(manifest, canvas2)],
          type: "AnnotationPage",
        },
      }),
    );
    const webAnnotation = {
      ...webAnnotation1,
      body: [{ type: "TextualBody", value: "updated", purpose: "commenting" }],
    };

    updateAnnotation(webAnnotation, manifest, canvas2, unit);
    const res = localStorage.getItem("annotations");

    const expected = JSON.stringify({
      [canvas]: {
        id: canvas,
        items: [annotation1(manifest, canvas)],
        type: "AnnotationPage",
      },
      [canvas2]: {
        id: canvas2,
        items: [annotation2(manifest, canvas2)],
        type: "AnnotationPage",
      },
    });

    expect(res).toStrictEqual(expected);
  });

  it("update annotation when there are multiple bodies", () => {
    const canvas = "canvas1";
    const manifest = "manifest";

    localStorage.setItem(
      "annotations",
      JSON.stringify({
        [canvas]: {
          id: canvas,
          items: [annotation1(manifest, canvas)],
          type: "AnnotationPage",
        },
      }),
    );

    updateAnnotation(webAnnotationMultipleBodies, manifest, canvas, unit);
    const res = localStorage.getItem("annotations");

    const expected = JSON.stringify({
      [canvas]: {
        id: canvas,
        items: [annotationMultipleBodies(manifest, canvas)],
        type: "AnnotationPage",
      },
    });
    expect(res).toStrictEqual(expected);
  });
});

describe("fetchAnnotations with guest user", () => {
  it("returns empty array if no saved annotations", async () => {
    const canvas = "canvas1";

    const res = await fetchAnnotations(canvas, unit);

    const expected = [];
    expect(res).toStrictEqual(expected);
  });

  it("returns web annotations for a given canvas", async () => {
    const canvas = "canvas1";
    const manifest = "manifest";
    localStorage.setItem(
      "annotations",
      JSON.stringify({
        [canvas]: {
          id: canvas,
          items: [annotation1(manifest, canvas)],
          type: "AnnotationPage",
        },
      }),
    );

    const res = await fetchAnnotations(canvas, unit);

    const expected = [
      {
        ...webAnnotation1,
        target: {
          ...webAnnotation1.target,
          source: {
            id: canvas,
            partOf: [{ id: manifest, type: "Manifest" }],
            type: "Canvas",
          },
        },
      },
    ];
    expect(res).toStrictEqual(expected);
  });

  it("returns empty array if canvas does not match saved annotation", async () => {
    const canvas = "canvas1";
    const canvas2 = "canvas2";
    const manifest = "manifest";
    localStorage.setItem(
      "annotations",
      JSON.stringify({
        [canvas]: {
          id: canvas,
          items: [annotation1(manifest, canvas)],
          type: "AnnotationPage",
        },
      }),
    );

    const res = await fetchAnnotations(canvas2, unit);

    const expected = [];
    expect(res).toStrictEqual(expected);
  });

  it("returns annotations with multiple bodies", async () => {
    const canvas = "canvas1";
    const manifest = "manifest";
    localStorage.setItem(
      "annotations",
      JSON.stringify({
        [canvas]: {
          id: canvas,
          items: [annotationMultipleBodies(manifest, canvas)],
          type: "AnnotationPage",
        },
      }),
    );

    const res = await fetchAnnotations(canvas, unit);

    const expected = [
      {
        ...webAnnotationMultipleBodies,
        target: {
          ...webAnnotationMultipleBodies.target,
          source: {
            id: canvas,
            partOf: [{ id: manifest, type: "Manifest" }],
            type: "Canvas",
          },
        },
      },
    ];
    expect(res).toStrictEqual(expected);
  });
});

describe("convertWebAnnotation", () => {
  it("converts web annoatation to IIIF annotation", () => {
    const canvas = "canvas1";
    const manifest = "manifest";

    const res = convertWebAnnotation(webAnnotation1, manifest, canvas, unit);

    expect(res).toStrictEqual(annotation1(manifest, canvas));
  });

  it("handles web annotation with empty body", () => {
    const webAnnotation = {
      "@context": "http://www.w3.org/ns/anno.jsonld",
      type: "Annotation",
      body: [],
      target: {
        source: "http://example.com/canvas/1",
        selector: {
          type: "FragmentSelector",
          conformsTo: "http://www.w3.org/TR/media-frags/",
          value: "xywh=pixel:10,20,30,40",
        },
      },
      id: "123abc",
    };
    const canvas = "canvas1";
    const manifest = "manifest";

    const res = convertWebAnnotation(webAnnotation, manifest, canvas, unit);

    const expected = {
      body: {},
      id: "123abc",
      motivation: "commenting",
      target: {
        selector: {
          conformsTo: "http://www.w3.org/TR/media-frags/",
          type: "FragmentSelector",
          value: "xywh=10,20,30,40",
        },
        source: {
          id: "canvas1",
          partOf: [
            {
              id: "manifest",
              type: "Manifest",
            },
          ],
          type: "Canvas",
        },
        type: "SpecificResource",
      },
      type: "Annotation",
    };
    expect(res).toStrictEqual(expected);
  });
});
