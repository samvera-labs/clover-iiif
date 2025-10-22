import ViewerContent, {
  ViewerContentProps,
} from "src/components/Viewer/Viewer/Content";
import { ViewerProvider, defaultState } from "src/context/viewer-context";
import { render, screen } from "@testing-library/react";

import { AnnotationResources } from "src/types/annotations";
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

const annotationResources: AnnotationResources = [
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
];

const props: ViewerContentProps = {
  activeCanvas: "http://example.com/iiif/foobar/canvas/1",
  painting: [],
  annotationResources: [],
  items: [],
  isAudioVideo: false,
  setContentSearchResource: () => {},
};

describe("ViewerContent", () => {
  test("renders an element with the 'clover-viewer-content' class name", () => {
    render(<ViewerContent {...props} />);
    expect(screen.getByTestId("clover-viewer-content")).toHaveClass(
      "clover-viewer-content",
    );
  });
});

describe("ViewerContent InformationPanel visibility", () => {
  test("does not render InformationPanel when no tabs are configured", () => {
    render(
      <ViewerProvider
        initialState={{
          ...defaultState,
          isInformationOpen: true,
          configOptions: {
            informationPanel: {
              renderAbout: false,
              renderToggle: true,
            },
          },
        }}
      >
        <ViewerContent {...props} />
      </ViewerProvider>,
    );
    expect(screen.queryByTestId("mock-information-panel")).toBeNull();
  });

  test("renders InformationPanel when About tab is enabled and panel is open", () => {
    render(
      <ViewerProvider
        initialState={{
          ...defaultState,
          isInformationOpen: true,
          configOptions: {
            informationPanel: {
              renderAbout: true,
            },
          },
        }}
      >
        <ViewerContent {...props} />
      </ViewerProvider>,
    );
    expect(screen.getByTestId("mock-information-panel")).toBeInTheDocument();
  });

  test("renders InformationPanel when Annotation tab is enabled and annotation resources exist and panel is open", () => {
    const propsWithAnnotationResources = { ...props, annotationResources };
    render(
      <ViewerProvider
        initialState={{
          ...defaultState,
          isInformationOpen: true,
          configOptions: {
            informationPanel: {
              renderAbout: false,
              renderAnnotation: true,
              renderToggle: true,
            },
          },
        }}
      >
        <ViewerContent {...propsWithAnnotationResources} />
      </ViewerProvider>,
    );
    expect(screen.getByTestId("mock-information-panel")).toBeInTheDocument();
  });

  test("renders InformationPanel when Content Search tab is enabled and resource exists and panel is open", () => {
    render(
      <ViewerProvider
        initialState={{
          ...defaultState,
          isInformationOpen: true,
          configOptions: {
            informationPanel: {
              renderAbout: false,
              renderAnnotation: false,
              renderContentSearch: true,
              renderToggle: true,
            },
          },
        }}
      >
        <ViewerContent {...props} contentSearchResource={annotationResources[0]} />
      </ViewerProvider>,
    );
    expect(screen.getByTestId("mock-information-panel")).toBeInTheDocument();
  });

test("renders InformationPanel when there is a tabbed plugin enabled", () => {
  const pluginWithPanel = [
    {
      id: "DemoPlugin",
      informationPanel: {
        label: { en: ["Demo Panel"] },
        component: () => <div>Demo Plugin Panel</div>,
      },
    },
  ];

  render(
    <ViewerProvider
      initialState={{
        ...defaultState,
        isInformationOpen: true,
        plugins: pluginWithPanel,
        configOptions: {
          informationPanel: {
            renderAbout: false,
            renderAnnotation: false,
            renderContentSearch: false,
            renderToggle: true,
          },
        },
      }}
    >
      <ViewerContent {...props} />
    </ViewerProvider>
  );

  expect(screen.getByTestId("mock-information-panel")).toBeInTheDocument();
});

  test("does not render InformationPanel if panel is closed, even if tabs are present", () => {
    render(
      <ViewerProvider
        initialState={{
          ...defaultState,
          isInformationOpen: false,
          configOptions: {
            informationPanel: {
              renderAbout: true,
              renderToggle: true,
            },
          },
        }}
      >
        <ViewerContent {...props} />
      </ViewerProvider>,
    );
    expect(screen.queryByTestId("mock-information-panel")).toBeNull();
  });
});
