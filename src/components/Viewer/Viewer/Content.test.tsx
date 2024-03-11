import ViewerContent, {
  ViewerContentProps,
} from "src/components/Viewer/Viewer/Content";
import { ViewerProvider, defaultState } from "src/context/viewer-context";
import { render, screen } from "@testing-library/react";

import InformationPanel from "../InformationPanel/InformationPanel";
import Painting from "src/components/Viewer/Painting/Painting";
import React from "react";

vi.mock("@radix-ui/react-collapsible");

vi.mock("src/components/Viewer/Painting/Painting");
vi.mocked(Painting).mockReturnValue(
  <div data-testid="mock-painting">Painting</div>,
);

vi.mock("src/components/Viewer/InformationPanel/InformationPanel");
vi.mocked(InformationPanel).mockReturnValue(
  <div data-testid="mock-information-panel">Information Panel</div>,
);

const props: ViewerContentProps = {
  activeCanvas: "http://example.com/iiif/foobar/canvas/1",
  painting: [],
  annotationResources: [
    {
      id: "http://localhost:3000/manifest/newspaper/newspaper_issue_1-anno_p2.json",
      type: "AnnotationPage",
      behavior: [],
      motivation: null,
      label: {
        none: ["Annotations"],
      },
      thumbnail: [],
      summary: null,
      requiredStatement: null,
      metadata: [],
      rights: null,
      provider: [],
      items: [
        {
          id: "http://localhost:3000/manifest/newspaper/newspaper_issue_1-anno_p2.json-1",
          type: "Annotation",
        },
      ],
      seeAlso: [],
      homepage: [],
      logo: [],
      rendering: [],
      service: [],
    },
  ],
  items: [],
  isAudioVideo: false,
};

describe("ViewerContent", () => {
  test("renders an element with the 'clover-viewer-content' class name", () => {
    render(<ViewerContent {...props} />);
    expect(screen.getByTestId("clover-viewer-content")).toHaveClass(
      "clover-viewer-content",
    );
  });
});

describe("ViewerContent with no Annotation Resources", () => {
  const newProps = {
    ...props,
    annotationResources: [],
  };

  test("renders InformationPanel by default", () => {
    render(<ViewerContent {...newProps} />);
    expect(screen.getByTestId("mock-information-panel"));
  });

  test("does not render InformationPanel if configured not to display it", () => {
    render(
      <ViewerProvider
        initialState={{
          ...defaultState,
          informationOpen: false,
          configOptions: {
            informationPanel: {
              open: false,
              renderAbout: false,
              renderToggle: false,
            },
          },
        }}
      >
        <ViewerContent {...newProps} />
      </ViewerProvider>,
    );
    expect(screen.queryByTestId("mock-information-panel")).toBeNull();
  });
});

describe("ViewerContent with Annotation Resources", () => {
  test("renders Annotations in InformationPanel even if initial default configuration turns off InformationPanel", () => {
    render(
      <ViewerProvider
        initialState={{
          ...defaultState,
          informationOpen: true,
          configOptions: {
            informationPanel: {
              open: false,
              renderAbout: false,
              renderToggle: false,
            },
          },
        }}
      >
        <ViewerContent {...props} />
      </ViewerProvider>,
    );
    expect(screen.getByTestId("mock-information-panel")).toBeInTheDocument();
  });
});
