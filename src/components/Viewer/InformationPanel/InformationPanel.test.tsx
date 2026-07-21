import { fireEvent, render, screen } from "@testing-library/react";

import InformationPanelView from "src/components/Viewer/InformationPanel/InformationPanel";
import React from "react";
import { Vault } from "@iiif/helpers/vault";
import type { AnnotationResources } from "src/types/annotations";
import { getAvailableTabs } from "src/lib/information-panel-helpers";

const mockDispatch = vi.fn();
let mockState: any = {};

function createDefaultState() {
  return {
    informationPanelResource: undefined,
    isAutoScrolling: false,
    isUserScrolling: false,
    vault: new Vault(),
    configOptions: {
      informationPanel: {
        renderAbout: true,
        renderAnnotation: false,
        renderContentSearch: false,
        renderToggle: true,
      },
    },
    annotationCollection: undefined,
    contentStateAnnotation: undefined,
    plugins: [],
  };
}

vi.mock("src/context/viewer-context", () => ({
  useViewerDispatch: () => mockDispatch,
  useViewerState: () => mockState,
}));

vi.mock("src/components/Viewer/InformationPanel/Annotation/Page", () => ({
  __esModule: true,
  default: () => <div>Annotation page</div>,
}));

const baseProps = {
  activeCanvas: "http://example.com/canvas/1",
  annotationResources: [],
  setContentSearchResource: vi.fn(),
};

const annotationResources: AnnotationResources = [
  {
    id: "a",
    type: "AnnotationPage",
    behavior: [],
    motivation: null,
    label: { none: ["Annotations"] },
    thumbnail: [],
    summary: null,
    requiredStatement: null,
    metadata: [],
    rights: null,
    provider: [],
    items: [{ id: "a1", type: "Annotation" }],
    seeAlso: [],
    homepage: [],
    logo: [],
    rendering: [],
    service: [],
  },
];

type InformationPanelViewProps = React.ComponentProps<
  typeof InformationPanelView
>;
type InformationPanelProps = Omit<
  InformationPanelViewProps,
  "availableTabs" | "filteredAnnotationResources"
> & {
  annotationResources?: AnnotationResources;
};

const InformationPanel: React.FC<InformationPanelProps> = ({
  annotationResources = [],
  ...props
}) => {
  const {
    annotationCollection,
    configOptions,
    contentStateAnnotation,
    visibleCanvases,
  } = mockState;
  const visibleCanvasIds =
    visibleCanvases?.map((canvas: { id: string }) => canvas.id) ?? [];
  const activeCanvases =
    visibleCanvasIds.length > 0 ? visibleCanvasIds : [props.activeCanvas];
  const availableTabs = getAvailableTabs({
    informationPanel: configOptions?.informationPanel,
    filteredAnnotationResources: annotationResources,
    contentSearchResource: props.contentSearchResource,
    pluginsWithInfoPanel: props.pluginsWithInfoPanel,
    contentStateAnnotation,
    annotationCollection,
    activeCanvases,
  });

  return (
    <InformationPanelView
      {...props}
      availableTabs={availableTabs}
      filteredAnnotationResources={annotationResources}
    />
  );
};

describe("InformationPanel", () => {
  beforeEach(() => {
    mockDispatch.mockClear();
    mockState = createDefaultState();
  });

  test("renders an element with the 'clover-viewer-information-panel' class name", () => {
    render(<InformationPanel {...baseProps} />);
    expect(screen.getByTestId("information-panel")).toHaveClass(
      "clover-viewer-information-panel",
    );
  });

  test("uses the translated label for the tab list", () => {
    render(<InformationPanel {...baseProps} />);

    expect(screen.getByRole("tablist", { name: "Select" })).toBeInTheDocument();
  });

  test("dispatches scrolling state only at the start and end of a scroll burst", () => {
    vi.useFakeTimers();
    try {
      render(<InformationPanel {...baseProps} />);
      mockDispatch.mockClear();

      const scrollRegion =
        screen.getByTestId("information-panel").lastElementChild;
      expect(scrollRegion).not.toBeNull();

      fireEvent.scroll(scrollRegion as Element);
      fireEvent.scroll(scrollRegion as Element);

      let scrollingUpdates = mockDispatch.mock.calls
        .map(([action]) => action)
        .filter((action) => action.type === "updateUserScrolling");
      expect(scrollingUpdates).toHaveLength(1);
      expect(scrollingUpdates[0].isUserScrolling).toBeTruthy();

      vi.advanceTimersByTime(1500);

      scrollingUpdates = mockDispatch.mock.calls
        .map(([action]) => action)
        .filter((action) => action.type === "updateUserScrolling");
      expect(scrollingUpdates).toHaveLength(2);
      expect(scrollingUpdates[1].isUserScrolling).toBeUndefined();
    } finally {
      vi.useRealTimers();
    }
  });
});

describe("InformationPanel useEffect — initial tab selection", () => {
  beforeEach(() => {
    mockDispatch.mockClear();
  });

  test("selects manifest-about when renderAbout is true", () => {
    mockState = createDefaultState();
    render(<InformationPanel {...baseProps} />);

    expect(mockDispatch).toHaveBeenCalledWith({
      type: "updateInformationPanelResource",
      informationPanelResource: "manifest-about",
    });
  });

  test("does not repeat automatic selection during strict effect replay", () => {
    mockState = createDefaultState();

    render(
      <React.StrictMode>
        <InformationPanel {...baseProps} />
      </React.StrictMode>,
    );

    expect(mockDispatch).toHaveBeenCalledTimes(1);
  });

  test("selects manifest-annotations when renderAnnotation is true and annotation resources exist", () => {
    mockState = {
      ...createDefaultState(),
      configOptions: {
        informationPanel: {
          renderAbout: false,
          renderAnnotation: true,
          renderContentSearch: false,
          renderToggle: true,
        },
      },
    };

    render(
      <InformationPanel
        {...baseProps}
        annotationResources={annotationResources}
      />,
    );

    expect(mockDispatch).toHaveBeenCalledWith({
      type: "updateInformationPanelResource",
      informationPanelResource: "manifest-annotations",
    });
  });

  test("selects manifest-annotations when contentStateAnnotation targets the active canvas", () => {
    const activeCanvas = "http://example.com/canvas/1";
    mockState = {
      ...createDefaultState(),
      configOptions: {
        informationPanel: {
          renderAbout: false,
          renderAnnotation: true,
          renderContentSearch: false,
          renderToggle: true,
        },
      },
      contentStateAnnotation: {
        id: "http://example.com/csa.json",
        type: "Annotation",
        motivation: "contentState",
        target: {
          type: "SpecificResource",
          source: { id: activeCanvas, type: "Canvas" },
        },
      },
    };

    render(<InformationPanel {...baseProps} activeCanvas={activeCanvas} />);

    expect(mockDispatch).toHaveBeenCalledWith({
      type: "updateInformationPanelResource",
      informationPanelResource: "manifest-annotations",
    });
  });

  test("selects manifest-annotations when contentStateAnnotation targets another visible canvas", () => {
    const activeCanvas = "http://example.com/canvas/1";
    const secondCanvas = "http://example.com/canvas/2";
    mockState = {
      ...createDefaultState(),
      visibleCanvases: [
        { id: activeCanvas, type: "Canvas" },
        { id: secondCanvas, type: "Canvas" },
      ],
      configOptions: {
        informationPanel: {
          renderAbout: false,
          renderAnnotation: true,
          renderContentSearch: false,
          renderToggle: true,
        },
      },
      contentStateAnnotation: {
        id: "http://example.com/csa.json",
        type: "Annotation",
        motivation: ["contentState"],
        target: {
          type: "SpecificResource",
          source: { id: secondCanvas, type: "Canvas" },
        },
        body: [],
      },
    };

    render(<InformationPanel {...baseProps} activeCanvas={activeCanvas} />);

    expect(mockDispatch).toHaveBeenCalledWith({
      type: "updateInformationPanelResource",
      informationPanelResource: "manifest-annotations",
    });
    expect(
      screen.getByRole("tab", { name: "Annotations" }),
    ).toBeInTheDocument();
  });

  test("does not dispatch manifest-about when renderAbout is false and no other tabs are available", () => {
    mockState = {
      ...createDefaultState(),
      configOptions: {
        informationPanel: {
          renderAbout: false,
          renderAnnotation: false,
          renderContentSearch: false,
          renderToggle: true,
        },
      },
    };

    render(<InformationPanel {...baseProps} />);

    // With all tabs disabled, no dispatch should occur for tab selection
    expect(mockDispatch).not.toHaveBeenCalledWith({
      type: "updateInformationPanelResource",
      informationPanelResource: "manifest-about",
    });
  });
});

describe("InformationPanel reactive behavior", () => {
  beforeEach(() => {
    mockDispatch.mockClear();
  });

  test("updates available tabs when annotationResources change from empty to populated", () => {
    mockState = {
      ...createDefaultState(),
      configOptions: {
        informationPanel: {
          renderAbout: false,
          renderAnnotation: true,
          renderContentSearch: false,
          renderToggle: true,
        },
      },
    };

    // Start with no annotations
    const { rerender } = render(
      <InformationPanel {...baseProps} annotationResources={[]} />,
    );

    // Should not dispatch manifest-annotations initially (no resources)
    expect(mockDispatch).not.toHaveBeenCalledWith({
      type: "updateInformationPanelResource",
      informationPanelResource: "manifest-annotations",
    });

    mockDispatch.mockClear();

    // Update with annotation resources
    rerender(
      <InformationPanel
        {...baseProps}
        annotationResources={annotationResources}
      />,
    );

    // Should dispatch to select the annotation tab
    expect(mockDispatch).toHaveBeenCalledWith({
      type: "updateInformationPanelResource",
      informationPanelResource: "manifest-annotations",
    });
  });

  test("selects configured async default tab when it becomes available after fallback", () => {
    mockState = {
      ...createDefaultState(),
      informationPanelResource: "",
      configOptions: {
        informationPanel: {
          renderAbout: true,
          renderAnnotation: false,
          renderContentSearch: true,
          renderToggle: true,
          defaultTab: "manifest-content-search",
        },
      },
    };

    const { rerender } = render(<InformationPanel {...baseProps} />);

    expect(mockDispatch).toHaveBeenCalledWith({
      type: "updateInformationPanelResource",
      informationPanelResource: "manifest-about",
    });

    mockDispatch.mockClear();
    mockState = {
      ...mockState,
      informationPanelResource: "manifest-about",
    };

    rerender(
      <InformationPanel
        {...baseProps}
        contentSearchResource={{ id: "search", type: "AnnotationPage" } as any}
      />,
    );

    expect(mockDispatch).toHaveBeenCalledWith({
      type: "updateInformationPanelResource",
      informationPanelResource: "manifest-content-search",
    });
  });

  test("does not apply an async default after the user explicitly selects another tab", () => {
    mockState = {
      ...createDefaultState(),
      informationPanelResource: "",
      configOptions: {
        informationPanel: {
          renderAbout: true,
          renderAnnotation: true,
          renderContentSearch: true,
          renderToggle: true,
          defaultTab: "manifest-content-search",
        },
      },
    };
    const { rerender } = render(
      <InformationPanel
        {...baseProps}
        annotationResources={annotationResources}
      />,
    );

    mockState = {
      ...mockState,
      informationPanelResource: "manifest-about",
    };
    rerender(
      <InformationPanel
        {...baseProps}
        annotationResources={annotationResources}
      />,
    );

    fireEvent.mouseDown(screen.getByRole("tab", { name: "Annotations" }), {
      button: 0,
      ctrlKey: false,
    });
    mockState = {
      ...mockState,
      informationPanelResource: "manifest-annotations",
    };
    rerender(
      <InformationPanel
        {...baseProps}
        annotationResources={annotationResources}
      />,
    );

    fireEvent.mouseDown(screen.getByRole("tab", { name: "About" }), {
      button: 0,
      ctrlKey: false,
    });
    mockState = {
      ...mockState,
      informationPanelResource: "manifest-about",
    };
    rerender(
      <InformationPanel
        {...baseProps}
        annotationResources={annotationResources}
      />,
    );

    mockDispatch.mockClear();

    rerender(
      <InformationPanel
        {...baseProps}
        annotationResources={annotationResources}
        contentSearchResource={{ id: "search", type: "AnnotationPage" } as any}
      />,
    );

    expect(mockDispatch).not.toHaveBeenCalledWith({
      type: "updateInformationPanelResource",
      informationPanelResource: "manifest-content-search",
    });
  });

  test("preserves selected tab when it remains available after props change", () => {
    mockState = {
      ...createDefaultState(),
      informationPanelResource: "manifest-about",
      configOptions: {
        informationPanel: {
          renderAbout: true,
          renderAnnotation: true,
          renderContentSearch: false,
          renderToggle: true,
        },
      },
    };

    const { rerender } = render(<InformationPanel {...baseProps} />);

    mockDispatch.mockClear();

    // Add annotation resources - but about tab is still available
    rerender(
      <InformationPanel
        {...baseProps}
        annotationResources={annotationResources}
      />,
    );

    // Should NOT dispatch a new tab selection since manifest-about is still available
    expect(mockDispatch).not.toHaveBeenCalledWith(
      expect.objectContaining({
        type: "updateInformationPanelResource",
      }),
    );
  });

  test("selects new default when current tab becomes unavailable", () => {
    mockState = {
      ...createDefaultState(),
      informationPanelResource: "manifest-about",
      configOptions: {
        informationPanel: {
          renderAbout: true,
          renderAnnotation: true,
          renderContentSearch: false,
          renderToggle: true,
        },
      },
    };

    const { rerender } = render(<InformationPanel {...baseProps} />);

    mockDispatch.mockClear();

    // Disable the about tab - current selection becomes invalid
    mockState = {
      ...mockState,
      configOptions: {
        informationPanel: {
          renderAbout: false,
          renderAnnotation: true,
          renderContentSearch: false,
          renderToggle: true,
        },
      },
    };

    rerender(
      <InformationPanel
        {...baseProps}
        annotationResources={annotationResources}
      />,
    );

    // Should dispatch to select manifest-annotations (next available tab)
    expect(mockDispatch).toHaveBeenCalledWith({
      type: "updateInformationPanelResource",
      informationPanelResource: "manifest-annotations",
    });
  });

  test("handles gracefully when all tabs become unavailable", () => {
    mockState = {
      ...createDefaultState(),
      informationPanelResource: "manifest-about",
      configOptions: {
        informationPanel: {
          renderAbout: true,
          renderAnnotation: false,
          renderContentSearch: false,
          renderToggle: true,
        },
      },
    };

    const { rerender } = render(<InformationPanel {...baseProps} />);

    mockDispatch.mockClear();

    // Disable all tabs
    mockState = {
      ...mockState,
      configOptions: {
        informationPanel: {
          renderAbout: false,
          renderAnnotation: false,
          renderContentSearch: false,
          renderToggle: true,
        },
      },
    };

    rerender(<InformationPanel {...baseProps} />);

    // Should not dispatch any tab selection (no tabs available)
    expect(mockDispatch).not.toHaveBeenCalledWith(
      expect.objectContaining({
        type: "updateInformationPanelResource",
      }),
    );
  });
});
