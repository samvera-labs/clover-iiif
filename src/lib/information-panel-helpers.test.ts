import {
  hasAnyPanel,
  getAvailableTabs,
  getDefaultTab,
  annotationTargetsCanvas,
} from "./information-panel-helpers";

describe("hasAnyPanel", () => {
  it("returns true when renderAbout is true", () => {
    expect(
      hasAnyPanel({
        informationPanel: {
          renderAbout: true,
          renderAnnotation: false,
          renderContentSearch: false,
        },
        pluginsWithInfoPanel: [],
        annotationResources: [],
        contentSearchResource: undefined,
      }),
    ).toBe(true);
  });

  it("returns true when renderAnnotation is true and annotationResources has items", () => {
    expect(
      hasAnyPanel({
        informationPanel: {
          renderAbout: false,
          renderAnnotation: true,
          renderContentSearch: false,
        },
        pluginsWithInfoPanel: [],
        annotationResources: [{ id: "a", type: "AnnotationPage" }],
        contentSearchResource: undefined,
      }),
    ).toBe(true);
  });

  it("returns true when renderAnnotation is true and contentStateAnnotation is present", () => {
    expect(
      hasAnyPanel({
        informationPanel: {
          renderAbout: false,
          renderAnnotation: true,
          renderContentSearch: false,
        },
        pluginsWithInfoPanel: [],
        annotationResources: [],
        contentSearchResource: undefined,
        contentStateAnnotation: { id: "csa", type: "Annotation" },
      }),
    ).toBe(true);
  });

  it("returns true when renderAnnotation is true and annotationCollection has pages", () => {
    expect(
      hasAnyPanel({
        informationPanel: {
          renderAbout: false,
          renderAnnotation: true,
          renderContentSearch: false,
        },
        pluginsWithInfoPanel: [],
        annotationResources: [],
        contentSearchResource: undefined,
        annotationCollection: { pages: [{ id: "p1", type: "AnnotationPage" }] },
      }),
    ).toBe(true);
  });

  it("returns false when only contentStateAnnotation is null and annotationCollection has no pages", () => {
    expect(
      hasAnyPanel({
        informationPanel: {
          renderAbout: false,
          renderAnnotation: true,
          renderContentSearch: false,
        },
        pluginsWithInfoPanel: [],
        annotationResources: [],
        contentSearchResource: undefined,
        contentStateAnnotation: null,
        annotationCollection: { pages: [] },
      }),
    ).toBe(false);
  });

  it("returns false when renderAnnotation is true but annotationResources is empty", () => {
    expect(
      hasAnyPanel({
        informationPanel: {
          renderAbout: false,
          renderAnnotation: true,
          renderContentSearch: false,
        },
        pluginsWithInfoPanel: [],
        annotationResources: [],
        contentSearchResource: undefined,
      }),
    ).toBe(false);
  });

  it("returns true when renderContentSearch is true and contentSearchResource is present", () => {
    expect(
      hasAnyPanel({
        informationPanel: {
          renderAbout: false,
          renderAnnotation: false,
          renderContentSearch: true,
        },
        pluginsWithInfoPanel: [],
        annotationResources: [],
        contentSearchResource: { id: "search-id", type: "AnnotationPage" },
      }),
    ).toBe(true);
  });

  it("returns false when renderContentSearch is true but contentSearchResource is undefined", () => {
    expect(
      hasAnyPanel({
        informationPanel: {
          renderAbout: false,
          renderAnnotation: false,
          renderContentSearch: true,
        },
        pluginsWithInfoPanel: [],
        annotationResources: [],
        contentSearchResource: undefined,
      }),
    ).toBe(false);
  });

  it("returns true when pluginsWithInfoPanel has items", () => {
    expect(
      hasAnyPanel({
        informationPanel: {
          renderAbout: false,
          renderAnnotation: false,
          renderContentSearch: false,
        },
        pluginsWithInfoPanel: [{ id: "PluginTab" }],
        annotationResources: [],
        contentSearchResource: undefined,
      }),
    ).toBe(true);
  });

  it("returns false when all panel types are false/empty", () => {
    expect(
      hasAnyPanel({
        informationPanel: {
          renderAbout: false,
          renderAnnotation: false,
          renderContentSearch: false,
        },
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
        informationPanel: {
          renderAbout: true,
          renderAnnotation: false,
          renderContentSearch: false,
        },
        annotationResources: [],
        contentSearchResource: undefined,
        pluginsWithInfoPanel: [],
      }),
    ).toStrictEqual(["manifest-about"]);
  });

  it("returns manifest-annotations when renderAnnotation is true and annotationResources has items", () => {
    expect(
      getAvailableTabs({
        informationPanel: {
          renderAbout: false,
          renderAnnotation: true,
          renderContentSearch: false,
        },
        annotationResources: [{ id: "a", type: "AnnotationPage" }],
        contentSearchResource: undefined,
        pluginsWithInfoPanel: [],
      }),
    ).toStrictEqual(["manifest-annotations"]);
  });

  it("returns manifest-annotations when renderAnnotation is true and contentStateAnnotation is present", () => {
    expect(
      getAvailableTabs({
        informationPanel: {
          renderAbout: false,
          renderAnnotation: true,
          renderContentSearch: false,
        },
        annotationResources: [],
        contentSearchResource: undefined,
        pluginsWithInfoPanel: [],
        contentStateAnnotation: { id: "csa", type: "Annotation" },
      }),
    ).toStrictEqual(["manifest-annotations"]);
  });

  it("returns manifest-annotations when renderAnnotation is true and annotationCollection has pages", () => {
    expect(
      getAvailableTabs({
        informationPanel: {
          renderAbout: false,
          renderAnnotation: true,
          renderContentSearch: false,
        },
        annotationResources: [],
        contentSearchResource: undefined,
        pluginsWithInfoPanel: [],
        annotationCollection: { pages: [{ id: "p1", type: "AnnotationPage" }] },
      }),
    ).toStrictEqual(["manifest-annotations"]);
  });

  it("returns manifest-content-search when renderContentSearch is true and contentSearchResource is present", () => {
    expect(
      getAvailableTabs({
        informationPanel: {
          renderAbout: false,
          renderAnnotation: false,
          renderContentSearch: true,
        },
        annotationResources: [],
        contentSearchResource: { id: "search-id", type: "AnnotationPage" },
        pluginsWithInfoPanel: [],
      }),
    ).toStrictEqual(["manifest-content-search"]);
  });

  it("returns plugin tab ids when pluginsWithInfoPanel has items", () => {
    expect(
      getAvailableTabs({
        informationPanel: {
          renderAbout: false,
          renderAnnotation: false,
          renderContentSearch: false,
        },
        annotationResources: [],
        contentSearchResource: undefined,
        pluginsWithInfoPanel: [{ id: "PluginTab" }, { id: "AnotherPlugin" }],
      }),
    ).toStrictEqual(["PluginTab", "AnotherPlugin"]);
  });

  it("returns all tab ids in priority order", () => {
    expect(
      getAvailableTabs({
        informationPanel: {
          renderAbout: true,
          renderAnnotation: true,
          renderContentSearch: true,
        },
        annotationResources: [{ id: "a", type: "AnnotationPage" }],
        contentSearchResource: { id: "search-id", type: "AnnotationPage" },
        pluginsWithInfoPanel: [{ id: "PluginTab" }],
      }),
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
        informationPanel: {
          renderAbout: false,
          renderAnnotation: false,
          renderContentSearch: false,
        },
        annotationResources: [],
        contentSearchResource: undefined,
        pluginsWithInfoPanel: [],
      }),
    ).toStrictEqual([]);
  });

  describe("hasAnyPanel / getAvailableTabs consistency", () => {
    const cases = [
      {
        informationPanel: {
          renderAbout: true,
          renderAnnotation: false,
          renderContentSearch: false,
        },
        expected: ["manifest-about"],
      },
      {
        informationPanel: {
          renderAbout: false,
          renderAnnotation: true,
          renderContentSearch: false,
        },
        expected: ["manifest-annotations"],
        annotationResources: [{ id: "a", type: "AnnotationPage" }],
      },
      {
        informationPanel: {
          renderAbout: false,
          renderAnnotation: false,
          renderContentSearch: true,
        },
        expected: ["manifest-content-search"],
        contentSearchResource: { id: "s", type: "AnnotationPage" },
      },
    ];

    cases.forEach(({ expected, ...opts }) => {
      it(`hasAnyPanel matches getAvailableTabs for ${JSON.stringify(expected)}`, () => {
        const tabs = getAvailableTabs(opts);
        const hasPanel = hasAnyPanel(opts);
        expect(hasPanel).toBe(tabs.length > 0);
        expect(tabs).toStrictEqual(expected);
      });
    });
  });

  describe("getAvailableTabs with filteredAnnotationResources", () => {
    it("excludes manifest-annotations when filteredAnnotationResources is empty and annotationResources has items", () => {
      expect(
        getAvailableTabs({
          informationPanel: {
            renderAbout: false,
            renderAnnotation: true,
            renderContentSearch: false,
          },
          annotationResources: [{ id: "a", type: "AnnotationPage", items: [] }],
          filteredAnnotationResources: [],
          contentSearchResource: undefined,
          pluginsWithInfoPanel: [],
        }),
      ).toStrictEqual([]);
    });

    it("includes manifest-annotations when filteredAnnotationResources has items", () => {
      expect(
        getAvailableTabs({
          informationPanel: {
            renderAbout: false,
            renderAnnotation: true,
            renderContentSearch: false,
          },
          annotationResources: [{ id: "a", type: "AnnotationPage", items: [] }],
          filteredAnnotationResources: [
            {
              id: "b",
              type: "AnnotationPage",
              items: [{ id: "c", type: "Annotation" }],
            },
          ],
          contentSearchResource: undefined,
          pluginsWithInfoPanel: [],
        }),
      ).toStrictEqual(["manifest-annotations"]);
    });
  });

  describe("getAvailableTabs with activeCanvas-scoped contentStateAnnotation", () => {
    it("excludes manifest-annotations when contentStateAnnotation targets a different canvas", () => {
      expect(
        getAvailableTabs({
          informationPanel: {
            renderAbout: false,
            renderAnnotation: true,
            renderContentSearch: false,
          },
          annotationResources: [],
          contentSearchResource: undefined,
          pluginsWithInfoPanel: [],
          contentStateAnnotation: {
            id: "csa",
            type: "Annotation",
            motivation: "contentState",
            target: {
              type: "SpecificResource",
              source: { id: "http://example.com/other-canvas", type: "Canvas" },
            },
          },
          activeCanvas: "http://example.com/active-canvas",
        }),
      ).toStrictEqual([]);
    });

    it("includes manifest-annotations when contentStateAnnotation targets the active canvas", () => {
      expect(
        getAvailableTabs({
          informationPanel: {
            renderAbout: false,
            renderAnnotation: true,
            renderContentSearch: false,
          },
          annotationResources: [],
          contentSearchResource: undefined,
          pluginsWithInfoPanel: [],
          contentStateAnnotation: {
            id: "csa",
            type: "Annotation",
            motivation: "contentState",
            target: {
              type: "SpecificResource",
              source: {
                id: "http://example.com/active-canvas",
                type: "Canvas",
              },
            },
          },
          activeCanvas: "http://example.com/active-canvas",
        }),
      ).toStrictEqual(["manifest-annotations"]);
    });
  });

  describe("hasAnyPanel and getAvailableTabs with empty result", () => {
    it("hasAnyPanel returns false when getAvailableTabs returns empty array", () => {
      const opts = {
        informationPanel: {
          renderAbout: false,
          renderAnnotation: false,
          renderContentSearch: false,
        },
        annotationResources: [],
        contentSearchResource: undefined,
        pluginsWithInfoPanel: [],
      };
      expect(hasAnyPanel(opts)).toBe(false);
      expect(getAvailableTabs(opts)).toStrictEqual([]);
    });
  });
});

describe("getDefaultTab", () => {
  it("returns configDefaultTab when it is in availableTabs", () => {
    expect(
      getDefaultTab(
        ["manifest-about", "manifest-annotations"],
        "manifest-annotations",
      ),
    ).toBe("manifest-annotations");
  });

  it("falls back to first available tab when configDefaultTab is not in availableTabs", () => {
    expect(
      getDefaultTab(
        ["manifest-about", "manifest-annotations"],
        "manifest-search",
      ),
    ).toBe("manifest-about");
  });

  it("returns first available tab when no configDefaultTab is provided", () => {
    expect(getDefaultTab(["manifest-about", "manifest-annotations"])).toBe(
      "manifest-about",
    );
  });

  it("returns undefined when availableTabs is empty", () => {
    expect(getDefaultTab([])).toBeUndefined();
  });

  it("returns undefined when availableTabs is empty even with configDefaultTab", () => {
    expect(getDefaultTab([], "manifest-about")).toBeUndefined();
  });
});

describe("annotationTargetsCanvas", () => {
  it("returns true when annotation has SpecificResource target matching activeCanvas", () => {
    expect(
      annotationTargetsCanvas(
        {
          id: "annotation-1",
          type: "Annotation",
          target: {
            type: "SpecificResource",
            source: { id: "canvas-1", type: "Canvas" },
          },
        } as any,
        "canvas-1",
      ),
    ).toBe(true);
  });

  it("returns false when SpecificResource target does not match activeCanvas", () => {
    expect(
      annotationTargetsCanvas(
        {
          id: "annotation-1",
          type: "Annotation",
          target: {
            type: "SpecificResource",
            source: { id: "canvas-2", type: "Canvas" },
          },
        } as any,
        "canvas-1",
      ),
    ).toBe(false);
  });

  it("returns true when annotation has direct target id matching activeCanvas", () => {
    expect(
      annotationTargetsCanvas(
        {
          id: "annotation-1",
          type: "Annotation",
          target: { id: "canvas-1" },
        } as any,
        "canvas-1",
      ),
    ).toBe(true);
  });

  it("returns true when annotation target source is a matching string", () => {
    expect(
      annotationTargetsCanvas(
        {
          id: "annotation-1",
          type: "Annotation",
          target: {
            type: "SpecificResource",
            source: "canvas-1",
          },
        } as any,
        "canvas-1",
      ),
    ).toBe(true);
  });

  it("returns true when one annotation target in an array matches activeCanvas", () => {
    expect(
      annotationTargetsCanvas(
        {
          id: "annotation-1",
          type: "Annotation",
          target: [
            { id: "canvas-2" },
            {
              type: "SpecificResource",
              source: { id: "canvas-1", type: "Canvas" },
            },
          ],
        } as any,
        "canvas-1",
      ),
    ).toBe(true);
  });

  it("returns false when direct target id does not match activeCanvas", () => {
    expect(
      annotationTargetsCanvas(
        {
          id: "annotation-1",
          type: "Annotation",
          target: { id: "canvas-2" },
        } as any,
        "canvas-1",
      ),
    ).toBe(false);
  });

  it("returns false when annotation is null", () => {
    expect(annotationTargetsCanvas(null, "canvas-1")).toBe(false);
  });

  it("returns false when annotation is undefined", () => {
    expect(annotationTargetsCanvas(undefined, "canvas-1")).toBe(false);
  });
});
