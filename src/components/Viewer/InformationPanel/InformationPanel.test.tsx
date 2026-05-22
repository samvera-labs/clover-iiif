import { render, screen } from "@testing-library/react";

import InformationPanel from "src/components/Viewer/InformationPanel/InformationPanel";
import React from "react";
import { Vault } from "@iiif/helpers/vault";

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

const baseProps = {
  activeCanvas: "http://example.com/canvas/1",
  annotationResources: [],
  setContentSearchResource: vi.fn(),
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
        annotationResources={[
          { id: "a", type: "AnnotationPage", items: [{ id: "a1", type: "Annotation" }] },
        ]}
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

    render(
      <InformationPanel
        {...baseProps}
        activeCanvas={activeCanvas}
      />,
    );

    expect(mockDispatch).toHaveBeenCalledWith({
      type: "updateInformationPanelResource",
      informationPanelResource: "manifest-annotations",
    });
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
