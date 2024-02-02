import OSD, { osdImageTypes } from "./OSD";
import { render, screen } from "@testing-library/react";

import React from "react";
import { ViewerProvider } from "src/context/viewer-context";

const props = {
  uri: "foobar",
  hasPlaceholder: false,
  imageType: "simpleImage" as osdImageTypes,
  annotationResources: [],
};

vi.mock("openseadragon", () => ({
  default: () => {
    return {
      addOverlaysToViewer: () => {},
      addSimpleImage: () => {},
    };
  },
}));

vi.mock("src/lib/openseadragon-helpers.ts");

describe("OSD", () => {
  test("renders an element with the 'clover-viewer-osd' class name", () => {
    render(
      <ViewerProvider>
        <OSD {...props} />
      </ViewerProvider>,
    );
    expect(screen.getByTestId("clover-viewer-osd-wrapper")).toHaveClass(
      "clover-viewer-osd-wrapper",
    );
  });
});
