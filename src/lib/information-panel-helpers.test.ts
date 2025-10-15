import { hasAnyPanel } from "./information-panel-helpers";

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
