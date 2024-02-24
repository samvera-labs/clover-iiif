import {
  saveAnnotation,
  deleteAnnotation,
  updateAnnotation,
  fetchAnnotation,
} from "./annotation-utils";

const webAnnotation1 = {
  "@context": "http://www.w3.org/ns/anno.jsonld",
  type: "Annotation",
  body: [{ type: "TextualBody", value: "first", purpose: "commenting" }],
  target: {
    source: "https://example.com/1",
    selector: {
      type: "FragmentSelector",
      conformsTo: "http://www.w3.org/TR/media-frags/",
      value: "xywh=pixel:10,20,30,40",
    },
  },
  id: "123abc",
};

const annotation1 = {
  body: { type: "TextualBody", value: "first" },
  id: "123abc",
  motivation: "commenting",
  target: {
    type: "SpecificResource",
    source: "https://example.com/1",
    selector: {
      type: "FragmentSelector",
      conformsTo: "http://www.w3.org/TR/media-frags/",
      value: "xywh=10,20,30,40",
    },
  },
  type: "Annotation",
};

const webAnnotation2 = {
  "@context": "http://www.w3.org/ns/anno.jsonld",
  type: "Annotation",
  body: [{ type: "TextualBody", value: "second", purpose: "commenting" }],
  target: {
    source: "https://example.com/2",
    selector: {
      type: "FragmentSelector",
      conformsTo: "http://www.w3.org/TR/media-frags/",
      value: "xywh=pixel:15,25,35,45",
    },
  },
  id: "456def",
};
const annotation2 = {
  body: { type: "TextualBody", value: "second" },
  id: "456def",
  motivation: "commenting",
  target: {
    type: "SpecificResource",
    source: "https://example.com/2",
    selector: {
      type: "FragmentSelector",
      conformsTo: "http://www.w3.org/TR/media-frags/",
      value: "xywh=15,25,35,45",
    },
  },
  type: "Annotation",
};

const webAnnotationMultipleBodies = {
  "@context": "http://www.w3.org/ns/anno.jsonld",
  type: "Annotation",
  body: [
    { type: "TextualBody", value: "second b", purpose: "commenting" },
    { type: "TextualBody", value: "second c", purpose: "commenting" },
  ],
  target: {
    source: "https://example.com/1",
    selector: {
      type: "FragmentSelector",
      conformsTo: "http://www.w3.org/TR/media-frags/",
      value: "xywh=pixel:10,20,30,40",
    },
  },
  id: "123abc",
};

const annotationMultipleBodies = {
  body: [
    { type: "TextualBody", value: "second b" },
    { type: "TextualBody", value: "second c" },
  ],
  id: "123abc",
  motivation: "commenting",
  target: {
    type: "SpecificResource",
    source: "https://example.com/1",
    selector: {
      type: "FragmentSelector",
      conformsTo: "http://www.w3.org/TR/media-frags/",
      value: "xywh=10,20,30,40",
    },
  },
  type: "Annotation",
};

const unit = "pixel";

describe("saveAnnotation", () => {
  afterEach(() => {
    localStorage.clear();
  });

  it("saves annotation when there are no saved annotation", () => {
    const canvas = "canvas1";

    saveAnnotation(webAnnotation1, canvas, unit);
    const res = localStorage.getItem("annotations");

    const expected = JSON.stringify({
      [canvas]: { id: canvas, items: [annotation1], type: "AnnotationPage" },
    });

    expect(res).toStrictEqual(expected);
  });

  it("saves annotation when there are saved annotation", () => {
    const canvas = "canvas1";
    localStorage.setItem(
      "annotations",
      JSON.stringify({
        [canvas]: { id: canvas, items: [annotation1], type: "AnnotationPage" },
      }),
    );

    saveAnnotation(webAnnotation2, canvas, unit);
    const res = localStorage.getItem("annotations");

    const expected = JSON.stringify({
      [canvas]: {
        id: canvas,
        items: [annotation1, annotation2],
        type: "AnnotationPage",
      },
    });

    expect(res).toStrictEqual(expected);
  });

  it("saves annotation when there are saved annotation with multiple canvas", () => {
    const canvas1 = "canvas1";
    const canvas2 = "canvas2";

    localStorage.setItem(
      "annotations",
      JSON.stringify({
        [canvas1]: {
          id: canvas1,
          items: [annotation1],
          type: "AnnotationPage",
        },
      }),
    );

    saveAnnotation(webAnnotation2, canvas2, unit);
    const res = localStorage.getItem("annotations");

    const expected = JSON.stringify({
      [canvas1]: { id: canvas1, items: [annotation1], type: "AnnotationPage" },
      [canvas2]: { id: canvas2, items: [annotation2], type: "AnnotationPage" },
    });

    expect(res).toStrictEqual(expected);
  });

  it("saves annotation with multiple bodies", () => {
    const canvas = "canvas1";

    saveAnnotation(webAnnotationMultipleBodies, canvas, unit);
    const res = localStorage.getItem("annotations");

    const expected = JSON.stringify({
      [canvas]: {
        id: canvas,
        items: [annotationMultipleBodies],
        type: "AnnotationPage",
      },
    });

    expect(res).toStrictEqual(expected);
  });
});

describe("deleteAnnotation", () => {
  afterEach(() => {
    localStorage.clear();
  });

  it("deletes annotation when there is one annotation", () => {
    const canvas = "canvas1";

    localStorage.setItem(
      "annotations",
      JSON.stringify({
        [canvas]: {
          id: canvas,
          items: [annotation1],
          type: "AnnotationPage",
        },
      }),
    );

    deleteAnnotation(webAnnotation1, canvas, unit);
    const res = localStorage.getItem("annotations");

    const expected = JSON.stringify({
      [canvas]: { id: canvas, items: [], type: "AnnotationPage" },
    });

    expect(res).toStrictEqual(expected);
  });

  it("deletes annotation when there are multiple annotations", () => {
    const canvas = "canvas1";

    localStorage.setItem(
      "annotations",
      JSON.stringify({
        [canvas]: {
          id: canvas,
          items: [annotation1, annotation2],
          type: "AnnotationPage",
        },
      }),
    );

    deleteAnnotation(webAnnotation1, canvas, unit);
    const res = localStorage.getItem("annotations");

    const expected = JSON.stringify({
      [canvas]: {
        id: canvas,
        items: [annotation2],
        type: "AnnotationPage",
      },
    });

    expect(res).toStrictEqual(expected);
  });

  it("deletes annotation when multiple canvases", () => {
    const canvas = "canvas1";
    const canvas2 = "canvas2";

    localStorage.setItem(
      "annotations",
      JSON.stringify({
        [canvas]: {
          id: canvas,
          items: [annotation1],
          type: "AnnotationPage",
        },
        [canvas2]: {
          id: canvas2,
          items: [annotation2],
          type: "AnnotationPage",
        },
      }),
    );

    deleteAnnotation(webAnnotation2, canvas2, unit);
    const res = localStorage.getItem("annotations");

    const expected = JSON.stringify({
      [canvas]: {
        id: canvas,
        items: [annotation1],
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

    localStorage.setItem(
      "annotations",
      JSON.stringify({
        [canvas]: {
          id: canvas,
          items: [annotation1],
          type: "AnnotationPage",
        },
        [canvas2]: {
          id: canvas2,
          items: [annotation2],
          type: "AnnotationPage",
        },
      }),
    );

    deleteAnnotation(webAnnotation2, canvas, unit);
    const res = localStorage.getItem("annotations");

    const expected = JSON.stringify({
      [canvas]: {
        id: canvas,
        items: [annotation1],
        type: "AnnotationPage",
      },
      [canvas2]: {
        id: canvas2,
        items: [annotation2],
        type: "AnnotationPage",
      },
    });

    expect(res).toStrictEqual(expected);
  });
});

describe("updateAnnotation", () => {
  afterEach(() => {
    localStorage.clear();
  });

  it("updates annotation when there is one annotation", () => {
    const canvas = "canvas1";
    localStorage.setItem(
      "annotations",
      JSON.stringify({
        [canvas]: {
          id: canvas,
          items: [annotation1],
          type: "AnnotationPage",
        },
      }),
    );
    const webAnnotation = {
      "@context": "http://www.w3.org/ns/anno.jsonld",
      type: "Annotation",
      body: [{ type: "TextualBody", value: "updated", purpose: "commenting" }],
      target: {
        source: "https://example.com/1",
        selector: {
          type: "FragmentSelector",
          conformsTo: "http://www.w3.org/TR/media-frags/",
          value: "xywh=100,200,300,400",
        },
      },
      id: "123abc",
    };

    updateAnnotation(webAnnotation, canvas, unit);
    const res = localStorage.getItem("annotations");

    const expected = JSON.stringify({
      [canvas]: {
        id: canvas,
        items: [
          {
            body: { type: "TextualBody", value: "updated" },
            id: "123abc",
            motivation: "commenting",
            target: {
              type: "SpecificResource",
              source: "https://example.com/1",
              selector: {
                type: "FragmentSelector",
                conformsTo: "http://www.w3.org/TR/media-frags/",
                value: "xywh=100,200,300,400",
              },
            },
            type: "Annotation",
          },
        ],
        type: "AnnotationPage",
      },
    });

    expect(res).toStrictEqual(expected);
  });

  it("updates annotation when there are multiple annotations", () => {
    const canvas = "canvas1";

    localStorage.setItem(
      "annotations",
      JSON.stringify({
        [canvas]: {
          id: canvas,
          items: [annotation1, annotation2],
          type: "AnnotationPage",
        },
      }),
    );
    const webAnnotation = {
      ...webAnnotation1,
      body: [{ type: "TextualBody", value: "updated", purpose: "commenting" }],
    };

    updateAnnotation(webAnnotation, canvas, unit);
    const res = localStorage.getItem("annotations");

    const expected = JSON.stringify({
      [canvas]: {
        id: canvas,
        items: [
          {
            ...annotation1,
            body: { type: "TextualBody", value: "updated" },
          },
          annotation2,
        ],
        type: "AnnotationPage",
      },
    });

    expect(res).toStrictEqual(expected);
  });

  it("does nothing if canvas for annotation does not match saved annotations", () => {
    const canvas = "canvas1";
    const canvas2 = "canvas2";

    localStorage.setItem(
      "annotations",
      JSON.stringify({
        [canvas]: {
          id: canvas,
          items: [annotation1],
          type: "AnnotationPage",
        },
        [canvas2]: {
          id: canvas,
          items: [annotation2],
          type: "AnnotationPage",
        },
      }),
    );
    const webAnnotation = {
      ...webAnnotation1,
      body: [{ type: "TextualBody", value: "updated", purpose: "commenting" }],
    };

    updateAnnotation(webAnnotation, canvas2, unit);
    const res = localStorage.getItem("annotations");

    const expected = JSON.stringify({
      [canvas]: {
        id: canvas,
        items: [annotation1],
        type: "AnnotationPage",
      },
      [canvas2]: {
        id: canvas2,
        items: [annotation2],
        type: "AnnotationPage",
      },
    });

    expect(res).toStrictEqual(expected);
  });

  it("update annotation when there are multiple bodies", () => {
    const canvas = "canvas1";
    localStorage.setItem(
      "annotations",
      JSON.stringify({
        [canvas]: {
          id: canvas,
          items: [annotation1],
          type: "AnnotationPage",
        },
      }),
    );

    updateAnnotation(webAnnotationMultipleBodies, canvas, unit);
    const res = localStorage.getItem("annotations");

    const expected = JSON.stringify({
      [canvas]: {
        id: canvas,
        items: [annotationMultipleBodies],
        type: "AnnotationPage",
      },
    });
    expect(res).toStrictEqual(expected);
  });
});

describe("fetchAnnotation", () => {
  it("returns empty array if no saved annotations", async () => {
    const canvas = "canvas1";

    const res = await fetchAnnotation(canvas, unit);

    const expected = [];
    expect(res).toStrictEqual(expected);
  });

  it("returns web annotations for a given canvas", async () => {
    const canvas = "canvas1";
    localStorage.setItem(
      "annotations",
      JSON.stringify({
        [canvas]: {
          id: canvas,
          items: [annotation1],
          type: "AnnotationPage",
        },
      }),
    );

    const res = await fetchAnnotation(canvas, unit);

    const expected = [webAnnotation1];
    expect(res).toStrictEqual(expected);
  });

  it("returns empty array if canvas does not match saved annotation", async () => {
    const canvas = "canvas1";
    const canvas2 = "canvas2";
    localStorage.setItem(
      "annotations",
      JSON.stringify({
        [canvas]: {
          id: canvas,
          items: [annotation1],
          type: "AnnotationPage",
        },
      }),
    );

    const res = await fetchAnnotation(canvas2, unit);

    const expected = [];
    expect(res).toStrictEqual(expected);
  });

  it("returns annotations with multiple bodies", async () => {
    const canvas = "canvas1";
    localStorage.setItem(
      "annotations",
      JSON.stringify({
        [canvas]: {
          id: canvas,
          items: [annotationMultipleBodies],
          type: "AnnotationPage",
        },
      }),
    );

    const res = await fetchAnnotation(canvas, unit);

    const expected = [webAnnotationMultipleBodies];
    expect(res).toStrictEqual(expected);
  });
});
