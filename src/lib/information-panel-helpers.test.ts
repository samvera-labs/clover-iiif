import { hasAnyPanel, getAvailableTabs } from "./information-panel-helpers";

describe("hasAnyPanel", () => {
  it("returns true when renderAbout is true", () => {
    expect(
      hasAnyPanel({
        renderAbout: true,
        renderAnnotation: false,
        renderContentSearch: false,
        pluginsWithInfoPanel: [],
        annotationResources: [],
        contentSearchResource: undefined,
      }),
    ).toBe(true);
  });

  it("returns true when renderAnnotation is true and annotationResources has items", () => {
    expect(
      hasAnyPanel({
        renderAbout: false,
        renderAnnotation: true,
        renderContentSearch: false,
        pluginsWithInfoPanel: [],
        annotationResources: [{ id: "a", type: "AnnotationPage" }],
        contentSearchResource: undefined,
      }),
    ).toBe(true);
  });

  it("returns false when renderAnnotation is true but annotationResources is empty", () => {
    expect(
      hasAnyPanel({
        renderAbout: false,
        renderAnnotation: true,
        renderContentSearch: false,
        pluginsWithInfoPanel: [],
        annotationResources: [],
        contentSearchResource: undefined,
      }),
    ).toBe(false);
  });

  it("returns true when renderContentSearch is true and contentSearchResource is present", () => {
    expect(
      hasAnyPanel({
        renderAbout: false,
        renderAnnotation: false,
        renderContentSearch: true,
        pluginsWithInfoPanel: [],
        annotationResources: [],
        contentSearchResource: { id: "search-id", type: "AnnotationPage" },
      }),
    ).toBe(true);
  });

  it("returns false when renderContentSearch is true but contentSearchResource is undefined", () => {
    expect(
      hasAnyPanel({
        renderAbout: false,
        renderAnnotation: false,
        renderContentSearch: true,
        pluginsWithInfoPanel: [],
        annotationResources: [],
        contentSearchResource: undefined,
      }),
    ).toBe(false);
  });

  it("returns true when pluginsWithInfoPanel has items", () => {
    expect(
      hasAnyPanel({
        renderAbout: false,
        renderAnnotation: false,
        renderContentSearch: false,
        pluginsWithInfoPanel: [{ id: "PluginTab" }],
        annotationResources: [],
        contentSearchResource: undefined,
      }),
    ).toBe(true);
  });

  it("returns false when all panel types are false/empty", () => {
    expect(
      hasAnyPanel({
        renderAbout: false,
        renderAnnotation: false,
        renderContentSearch: false,
        pluginsWithInfoPanel: [],
        annotationResources: [],
        contentSearchResource: undefined,
      }),
    ).toBe(false);
  });
});

describe("getAvailableTabs", () => {
  it("returns manifest-about when renderAbout is true", () => {
    expect(
      getAvailableTabs({
        renderAbout: true,
        renderAnnotation: false,
        annotationResources: [],
        renderContentSearch: false,
        contentSearchResource: undefined,
        pluginsWithInfoPanel: [],
      })
    ).toStrictEqual(["manifest-about"]);
  });

  it("returns manifest-annotations when renderAnnotation is true and annotationResources has items", () => {
    expect(
      getAvailableTabs({
        renderAbout: false,
        renderAnnotation: true,
        annotationResources: [{ id: "a", type: "AnnotationPage" }],
        renderContentSearch: false,
        contentSearchResource: undefined,
        pluginsWithInfoPanel: [],
      })
    ).toStrictEqual(["manifest-annotations"]);
  });

  it("returns manifest-content-search when renderContentSearch is true and contentSearchResource is present", () => {
    expect(
      getAvailableTabs({
        renderAbout: false,
        renderAnnotation: false,
        annotationResources: [],
        renderContentSearch: true,
        contentSearchResource: { id: "search-id", type: "AnnotationPage" },
        pluginsWithInfoPanel: [],
      })
    ).toStrictEqual(["manifest-content-search"]);
  });

  it("returns plugin tab ids when pluginsWithInfoPanel has items", () => {
    expect(
      getAvailableTabs({
        renderAbout: false,
        renderAnnotation: false,
        annotationResources: [],
        renderContentSearch: false,
        contentSearchResource: undefined,
        pluginsWithInfoPanel: [{ id: "PluginTab" }, { id: "AnotherPlugin" }],
      })
    ).toStrictEqual(["PluginTab", "AnotherPlugin"]);
  });

  it("returns all tab ids in priority order", () => {
    expect(
      getAvailableTabs({
        renderAbout: true,
        renderAnnotation: true,
        annotationResources: [{ id: "a", type: "AnnotationPage" }],
        renderContentSearch: true,
        contentSearchResource: { id: "search-id", type: "AnnotationPage" },
        pluginsWithInfoPanel: [{ id: "PluginTab" }],
      })
    ).toStrictEqual([
      "manifest-about",
      "manifest-annotations",
      "manifest-content-search",
      "PluginTab",
    ]);
  });

  it("returns an empty array when nothing is enabled or present", () => {
    expect(
      getAvailableTabs({
        renderAbout: false,
        renderAnnotation: false,
        annotationResources: [],
        renderContentSearch: false,
        contentSearchResource: undefined,
        pluginsWithInfoPanel: [],
      })
    ).toStrictEqual([]);
  });
});
