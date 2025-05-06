import { ViewerProvider, defaultState } from "src/context/viewer-context";
import { render, screen } from "@testing-library/react";

import { AnnotationPageNormalized } from "@iiif/presentation-3";
import Page from "./Page";
import React from "react";
import { Vault } from "@iiif/helpers/vault";
import simpleAnnotationManifest from "src/fixtures/iiif-cookbook/simple-annotation.json";

const props: { annotationPage: AnnotationPageNormalized } = {
  annotationPage: {
    id: "https://iiif.io/api/cookbook/recipe/0266-full-canvas-annotation/canvas-1/annopage-2",
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
        id: "https://iiif.io/api/cookbook/recipe/0266-full-canvas-annotation/canvas-1/annopage-2/anno-1",
        type: "Annotation",
      },
    ],
    seeAlso: [],
    homepage: [],
    logo: [],
    rendering: [],
    service: [],
  },
};

describe("Page", () => {
  const vault = new Vault();

  it("should render the component", async () => {
    await vault.loadManifest("", simpleAnnotationManifest);

    render(
      <ViewerProvider initialState={{ ...defaultState, vault }}>
        <Page {...props} />
      </ViewerProvider>,
    );

    const wrapper = screen.getByTestId("annotation-page");
    expect(wrapper.querySelector("header")).toBeInTheDocument();

    const items = screen.getByTestId("annotation-page-items");
    expect(items).toBeInTheDocument();
    expect(items.children.length).toBe(1);
  });

  it("should not render the component if no annotations exist on the canvas", async () => {
    const newProps: { annotationPage: AnnotationPageNormalized } = {
      annotationPage: {
        ...props.annotationPage,
        items: [],
      },
    };

    await vault.loadManifest("", simpleAnnotationManifest);

    render(
      <ViewerProvider initialState={{ ...defaultState, vault }}>
        <Page {...newProps} />
      </ViewerProvider>,
    );

    const el = screen.queryByTestId("annotation-page");
    expect(el).not.toBeInTheDocument();
  });
});
