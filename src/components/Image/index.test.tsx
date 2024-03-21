import { render, screen } from "@testing-library/react";

import CloverImage from "src/components/Image";
import React from "react";

describe("Image component", () => {
  it("renders Image with an annotation body including a IIIF image service", () => {
    render(
      <CloverImage
        body={{
          id: "https://iiif.stack.rdc.library.northwestern.edu/iiif/2/180682c9-dfaf-4881-b7b6-1f2f21092d4f/full/600,/0/default.jpg",
          type: "Image",
          format: "image/jpeg",
          service: [
            {
              id: "https://iiif.stack.rdc.library.northwestern.edu/iiif/2/180682c9-dfaf-4881-b7b6-1f2f21092d4f",
              profile: "http://iiif.io/api/image/2/level2.json",
              type: "ImageService2",
            },
          ],
          width: 3780,
          height: 4440,
        }}
      />,
    );
    const image = screen.getByTestId("clover-iiif-image-openseadragon");
    expect(image).toHaveClass("clover-iiif-image-openseadragon");
  });

  it("renders Image with an annotation body with a simple image", () => {
    render(
      <CloverImage
        body={{
          id: "https://iiif.stack.rdc.library.northwestern.edu/iiif/2/180682c9-dfaf-4881-b7b6-1f2f21092d4f/full/600,/0/default.jpg",
          type: "Image",
          format: "image/jpeg",
          width: 600,
          height: 600,
        }}
      />,
    );
    const image = screen.getByTestId("clover-iiif-image-openseadragon");
    expect(image).toHaveClass("clover-iiif-image-openseadragon");
  });

  it("renders Image with a src string", () => {
    render(
      <CloverImage src="https://iiif.stack.rdc.library.northwestern.edu/iiif/2/180682c9-dfaf-4881-b7b6-1f2f21092d4f/full/600,/0/default.jpg" />,
    );
    const image = screen.getByTestId("clover-iiif-image-openseadragon");
    expect(image).toHaveClass("clover-iiif-image-openseadragon");
  });

  it("renders Image with a src string and tiled image", () => {
    render(
      <CloverImage
        src="https://iiif.stack.rdc.library.northwestern.edu/iiif/2/180682c9-dfaf-4881-b7b6-1f2f21092d4f"
        isTiledImage={true}
      />,
    );
    const image = screen.getByTestId("clover-iiif-image-openseadragon");
    expect(image).toHaveClass("clover-iiif-image-openseadragon");
  });

  it("renders Image with a navigator by default", () => {
    render(
      <CloverImage src="https://iiif.stack.rdc.library.northwestern.edu/iiif/2/180682c9-dfaf-4881-b7b6-1f2f21092d4f/full/600,/0/default.jpg" />,
    );

    const navigator = screen.queryByTestId(
      "clover-iiif-image-openseadragon-navigator",
    );
    expect(navigator).not.toBeNull();
  });

  it("renders Image and respect OpenSeadragon configurations", () => {
    render(
      <CloverImage
        src="https://iiif.stack.rdc.library.northwestern.edu/iiif/2/180682c9-dfaf-4881-b7b6-1f2f21092d4f/full/600,/0/default.jpg"
        openSeadragonConfig={{ showNavigator: false }}
      />,
    );
    const image = screen.getByTestId("clover-iiif-image-openseadragon");
    expect(image).toHaveClass("clover-iiif-image-openseadragon");

    const navigator = screen.queryByTestId(
      "clover-iiif-image-openseadragon-navigator",
    );
    expect(navigator).toBeNull();
  });

  it("renders Image and return OpenSeadragon instance", () => {
    render(
      <CloverImage
        src="https://iiif.stack.rdc.library.northwestern.edu/iiif/2/180682c9-dfaf-4881-b7b6-1f2f21092d4f/full/600,/0/default.jpg"
        instanceId="test-instance-id"
        openSeadragonCallback={(openSeadragon) => {
          expect(openSeadragon).toBeDefined();
          expect(openSeadragon.id).toBe("openseadragon-test-instance-id");
        }}
      />,
    );
  });
});
