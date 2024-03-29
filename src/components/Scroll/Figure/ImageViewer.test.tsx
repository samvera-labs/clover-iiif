import { render, screen } from "@testing-library/react";

import { IIIFExternalWebResource } from "@iiif/presentation-3";
import ImageViewer from "src/components/Scroll/Figure/ImageViewer";
import React from "react";

const body: IIIFExternalWebResource = {
  type: "Image",
  format: "image/jpeg",
  id: "https://example.com/image.jpg",
  width: 1000,
  height: 1000,
};

describe("ImageViewer", () => {
  it("should render an OpenSeadragon instance", () => {
    render(<ImageViewer body={body} />);

    expect(screen.getByTestId("scroll-figure-image")).toBeInTheDocument();
    expect(
      screen.getByTestId("clover-iiif-image-openseadragon-viewport"),
    ).toBeInTheDocument();
  });
});
