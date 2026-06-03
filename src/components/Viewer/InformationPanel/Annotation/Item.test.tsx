import { ViewerProvider, defaultState, useViewerState } from "src/context/viewer-context";
import { fireEvent, render, screen } from "@testing-library/react";

import AnnotationItem from "./Item";
import AnnotationItemHTML from "./HTML";
import AnnotationItemImage from "./Image";
import AnnotationItemPlainText from "./PlainText";
import AnnotationItemVTT from "./VTT/VTT";
import { AnnotationNormalized } from "@iiif/presentation-3";
import React from "react";
import { Vault } from "@iiif/helpers/vault";
import htmlAnnotationManifest from "src/fixtures/iiif-cookbook/0019-html-in-annotations.json";
import imageInAnntationManifest from "src/fixtures/iiif-cookbook/0377-image-in-annotation.json";
import simpleAnnotationManifest from "src/fixtures/iiif-cookbook/simple-annotation.json";
import vttAnnotationManifest from "src/fixtures/iiif-cookbook/0219-using-caption-file.json";

vi.mock("src/components/Viewer/InformationPanel/Annotation/HTML");
vi.mocked(AnnotationItemHTML).mockReturnValue(<div>HTML</div>);

vi.mock("src/components/Viewer/InformationPanel/Annotation/Image");
vi.mocked(AnnotationItemImage).mockReturnValue(<div>Image</div>);

vi.mock("src/components/Viewer/InformationPanel/Annotation/PlainText");
vi.mocked(AnnotationItemPlainText).mockImplementation(({ value, handleClick }) => (
  <button type="button" onClick={handleClick}>
    {value}
  </button>
));

vi.mock("src/components/Viewer/InformationPanel/Annotation/VTT/VTT");
vi.mocked(AnnotationItemVTT).mockReturnValue(<div>VTT</div>);

describe("AnnotationItem", () => {
  let vault: Vault;

  const Probe = () => {
    const { activeAnnotationId, activeCanvas, pendingAnnotationTarget, activeManifest } = useViewerState();

    return (
      <div>
        <span data-testid="active-annotation">{activeAnnotationId ?? ""}</span>
        <span data-testid="active-canvas">{activeCanvas}</span>
        <span data-testid="pending-target">{pendingAnnotationTarget ? `${pendingAnnotationTarget.canvasId}:${pendingAnnotationTarget.annotationId}` : ""}</span>
        <span data-testid="active-manifest">{activeManifest}</span>
      </div>
    );
  };

  beforeEach(() => {
    vault = new Vault();
  });

  it("should render a plain text annotation item", async () => {
    await vault.loadManifest("", simpleAnnotationManifest);
    const mockAnnotation: AnnotationNormalized = vault.get(
      "https://iiif.io/api/cookbook/recipe/0266-full-canvas-annotation/canvas-1/annopage-2/anno-1",
    );

    render(
      <ViewerProvider initialState={{ ...defaultState, vault }}>
        <AnnotationItem annotation={mockAnnotation} />
      </ViewerProvider>,
    );
    expect(screen.getByText("Plain Text")).toBeInTheDocument();
  });

  it("should render an HTML annotation item", async () => {
    await vault.loadManifest("", htmlAnnotationManifest);
    const mockAnnotation: AnnotationNormalized = vault.get(
      "https://iiif.io/api/cookbook/recipe/0019-html-in-annotations/canvas-1/annopage-2/anno-1",
    );

    render(
      <ViewerProvider initialState={{ ...defaultState, vault }}>
        <AnnotationItem annotation={mockAnnotation} />
      </ViewerProvider>,
    );
    expect(screen.getByText("HTML")).toBeInTheDocument();
  });

  it("should render an image annotation item", async () => {
    await vault.loadManifest("", imageInAnntationManifest);
    const mockAnnotation: AnnotationNormalized = vault.get(
      "https://iiif.io/api/cookbook/recipe/0377-image-in-annotation/canvas-1/annopage-2/anno-1",
    );

    render(
      <ViewerProvider initialState={{ ...defaultState, vault }}>
        <AnnotationItem annotation={mockAnnotation} />
      </ViewerProvider>,
    );
    expect(screen.getByText("Image")).toBeInTheDocument();
  });

  it("should render an VTT annotation item", async () => {
    await vault.loadManifest("", vttAnnotationManifest);
    const mockAnnotation: AnnotationNormalized = vault.get(
      "https://iiif.io/api/cookbook/recipe/0219-using-caption-file/canvas/page2/a1",
    );

    render(
      <ViewerProvider initialState={{ ...defaultState, vault }}>
        <AnnotationItem annotation={mockAnnotation} />
      </ViewerProvider>,
    );
    expect(screen.getByText("VTT")).toBeInTheDocument();
  });

  it("renders when annotation body is a single object", async () => {
    const mockAnnotation = {
      id: "anno-single-body",
      type: "Annotation",
      motivation: ["commenting"],
      body: {
        type: "TextualBody",
        value: "Single body value",
        format: "text/plain",
      },
      target: "https://example.org/canvas/1",
    } as unknown as AnnotationNormalized;

    render(
      <ViewerProvider initialState={{ ...defaultState, vault }}>
        <AnnotationItem annotation={mockAnnotation} />
      </ViewerProvider>,
    );

    expect(screen.getByText("Plain Text")).toBeInTheDocument();
  });

  it("sets pending target and active annotation when clicked on a non-visible canvas", async () => {
    const mockAnnotation = {
      id: "anno-search-result",
      type: "Annotation",
      motivation: ["commenting"],
      body: {
        type: "TextualBody",
        value: "Search result",
        format: "text/plain",
      },
      target: {
        type: "SpecificResource",
        source: {
          id: "https://example.org/iiif/canvas/2",
          type: "Canvas",
          partOf: [{ id: "https://example.org/iiif/manifest/1", type: "Manifest" }],
        },
      },
    } as unknown as AnnotationNormalized;

    render(
      <ViewerProvider
        initialState={{
          ...defaultState,
          vault,
          activeCanvas: "https://example.org/iiif/canvas/1",
          activeManifest: "https://example.org/iiif/manifest/old",
          visibleCanvases: [{ id: "https://example.org/iiif/canvas/1", type: "Canvas" } as any],
        }}
      >
        <AnnotationItem annotation={mockAnnotation} />
        <Probe />
      </ViewerProvider>,
    );

    fireEvent.click(screen.getByTestId("annotation-item"));

    expect(screen.getByTestId("active-annotation")).toHaveTextContent("anno-search-result");
    expect(screen.getByTestId("active-canvas")).toHaveTextContent("https://example.org/iiif/canvas/2");
    expect(screen.getByTestId("pending-target")).toHaveTextContent("https://example.org/iiif/canvas/2:anno-search-result");
    expect(screen.getByTestId("active-manifest")).toHaveTextContent("https://example.org/iiif/manifest/1");
  });
});
