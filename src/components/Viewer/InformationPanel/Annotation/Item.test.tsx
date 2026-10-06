import { ViewerProvider, defaultState } from "src/context/viewer-context";
import { render, screen } from "@testing-library/react";

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
import pointSelector from "../../../../../public/manifest/content-state/point-selector.json";

vi.mock("src/components/Viewer/InformationPanel/Annotation/HTML");
vi.mocked(AnnotationItemHTML).mockReturnValue(<div>HTML</div>);

vi.mock("src/components/Viewer/InformationPanel/Annotation/Image");
vi.mocked(AnnotationItemImage).mockReturnValue(<div>Image</div>);

vi.mock("src/components/Viewer/InformationPanel/Annotation/PlainText");
vi.mocked(AnnotationItemPlainText).mockReturnValue(<div>Plain Text</div>);

vi.mock("src/components/Viewer/InformationPanel/Annotation/VTT/VTT");
vi.mocked(AnnotationItemVTT).mockReturnValue(<div>VTT</div>);

describe("AnnotationItem", () => {
  let vault: Vault;

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
    expect(
      screen.getByText("VTT").closest(".clover-iiif-annotation-item"),
    ).not.toHaveAttribute("data-content");
  });

  it.each([0, 2318])(
    "keeps a bodyless PointSelector at %s as a timestamp-only cue",
    (time) => {
      const annotation = {
        ...pointSelector,
        target: {
          ...pointSelector.target,
          selector: { type: "PointSelector", t: time },
        },
      } as unknown as AnnotationNormalized;
      render(
        <ViewerProvider initialState={{ ...defaultState, vault }}>
          <AnnotationItem annotation={annotation} />
        </ViewerProvider>,
      );
      const props = vi.mocked(AnnotationItemVTT).mock.calls.at(-1)?.[0];
      expect(props?.inlineCues).toEqual([
        expect.objectContaining({ start: time, text: "", html: "" }),
      ]);
      expect(props?.vttUri).toBeUndefined();
      expect(
        screen.getByText("VTT").closest(".clover-iiif-annotation-item"),
      ).not.toHaveAttribute("data-content");
    },
  );
});
