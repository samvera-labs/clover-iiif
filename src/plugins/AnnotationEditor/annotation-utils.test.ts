import {
  saveAnnotation,
  deleteAnnotation,
  updateAnnotation,
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
      value: "xywh=10,20,30,40",
    },
  },
  id: "123abc",
};

const annotation1 = {
  body: { type: "TextualBody", value: "first" },
  id: "123abc",
  motivation: "commenting",
  target: {
    source: "https://example.com/1",
    selector: {
      type: "FragmentSelector",
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
      value: "xywh=15,25,35,45",
    },
  },
  id: "456def",
};
const annotation2 = {
  body: { type: "TextualBody", value: "second" },
  id: "456def",
  motivation: "commenting",
  target: {
    source: "https://example.com/2",
    selector: {
      type: "FragmentSelector",
      value: "xywh=15,25,35,45",
    },
  },
  type: "Annotation",
};

describe("saveAnnotation", () => {
  afterEach(() => {
    localStorage.clear();
  });

  it("saves annotation to local storage when no saved annotation", () => {
    const canvas = "canvas1";

    saveAnnotation(webAnnotation1, canvas);
    const res = localStorage.getItem("annotations");

    const expected = JSON.stringify({
      [canvas]: [annotation1],
    });

    expect(res).toBe(expected);
  });

  it("saves annotation to local storage when there are saved annotation", () => {
    const canvas = "canvas1";
    localStorage.setItem(
      "annotations",
      JSON.stringify({
        [canvas]: [annotation1],
      }),
    );

    saveAnnotation(webAnnotation2, canvas);
    const res = localStorage.getItem("annotations");

    const expected = JSON.stringify({
      [canvas]: [annotation1, annotation2],
    });

    expect(res).toBe(expected);
  });

  it("saves annotation to local storage when there are saved annotation with diffrent canvas", () => {
    const canvas1 = "canvas1";
    const canvas2 = "canvas2";

    localStorage.setItem(
      "annotations",
      JSON.stringify({
        [canvas1]: [annotation1],
      }),
    );

    saveAnnotation(webAnnotation2, canvas2);
    const res = localStorage.getItem("annotations");

    const expected = JSON.stringify({
      [canvas1]: [annotation1],
      [canvas2]: [annotation2],
    });

    expect(res).toBe(expected);
  });
});

describe("deleteAnnotation", () => {
  afterEach(() => {
    localStorage.clear();
  });

  it("deletes annotation from local storage", () => {
    const canvas = "canvas1";

    localStorage.setItem(
      "annotations",
      JSON.stringify({
        [canvas]: [annotation1],
      }),
    );

    deleteAnnotation(webAnnotation1, canvas);
    const res = localStorage.getItem("annotations");

    const expected = JSON.stringify({
      [canvas]: [],
    });

    expect(res).toBe(expected);
  });

  it("deletes annotation from local storage when multiple annotations", () => {
    const canvas = "canvas1";

    localStorage.setItem(
      "annotations",
      JSON.stringify({
        [canvas]: [annotation1, annotation2],
      }),
    );

    deleteAnnotation(webAnnotation1, canvas);
    const res = localStorage.getItem("annotations");

    const expected = JSON.stringify({
      [canvas]: [annotation2],
    });

    expect(res).toBe(expected);
  });

  it("deletes annotation from local storage when multiple canvases", () => {
    const canvas = "canvas1";
    const canvas2 = "canvas2";

    localStorage.setItem(
      "annotations",
      JSON.stringify({
        [canvas]: [annotation1],
        [canvas2]: [annotation2],
      }),
    );

    deleteAnnotation(webAnnotation2, canvas2);
    const res = localStorage.getItem("annotations");

    const expected = JSON.stringify({
      [canvas]: [annotation1],
      [canvas2]: [],
    });

    expect(res).toBe(expected);
  });

  it("does nothing if canvas for annotation does not match", () => {
    const canvas = "canvas1";
    const canvas2 = "canvas2";

    localStorage.setItem(
      "annotations",
      JSON.stringify({
        [canvas]: [annotation1],
        [canvas2]: [annotation2],
      }),
    );

    deleteAnnotation(webAnnotation2, canvas);
    const res = localStorage.getItem("annotations");

    const expected = JSON.stringify({
      [canvas]: [annotation1],
      [canvas2]: [annotation2],
    });

    expect(res).toBe(expected);
  });
});

describe("updateAnnotation", () => {
  afterEach(() => {
    localStorage.clear();
  });

  it("updates annotation from local storage", () => {
    const canvas = "canvas1";

    localStorage.setItem(
      "annotations",
      JSON.stringify({
        [canvas]: [annotation1],
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
          value: "xywh=10,20,30,40",
        },
      },
      id: "123abc",
    };

    updateAnnotation(webAnnotation, canvas);
    const res = localStorage.getItem("annotations");

    const expected = JSON.stringify({
      [canvas]: [
        {
          body: { type: "TextualBody", value: "updated" },
          id: "123abc",
          motivation: "commenting",
          target: {
            source: "https://example.com/1",
            selector: {
              type: "FragmentSelector",
              value: "xywh=10,20,30,40",
            },
          },
          type: "Annotation",
        },
      ],
    });

    expect(res).toBe(expected);
  });

  it("updates annotation from local storage when multiple annotations", () => {
    const canvas = "canvas1";

    localStorage.setItem(
      "annotations",
      JSON.stringify({
        [canvas]: [annotation1, annotation2],
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
          value: "xywh=10,20,30,40",
        },
      },
      id: "123abc",
    };

    updateAnnotation(webAnnotation, canvas);
    const res = localStorage.getItem("annotations");

    const expected = JSON.stringify({
      [canvas]: [
        {
          body: { type: "TextualBody", value: "updated" },
          id: "123abc",
          motivation: "commenting",
          target: {
            source: "https://example.com/1",
            selector: {
              type: "FragmentSelector",
              value: "xywh=10,20,30,40",
            },
          },
          type: "Annotation",
        },
        annotation2,
      ],
    });

    expect(res).toBe(expected);
  });

  it("does nothing if canvas for annotation does not match", () => {
    const canvas = "canvas1";
    const canvas2 = "canvas2";

    localStorage.setItem(
      "annotations",
      JSON.stringify({
        [canvas]: [annotation1],
        [canvas2]: [annotation2],
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
          value: "xywh=10,20,30,40",
        },
      },
      id: "123abc",
    };

    updateAnnotation(webAnnotation, canvas2);
    const res = localStorage.getItem("annotations");

    const expected = JSON.stringify({
      [canvas]: [annotation1],
      [canvas2]: [annotation2],
    });

    expect(res).toBe(expected);
  });
});
