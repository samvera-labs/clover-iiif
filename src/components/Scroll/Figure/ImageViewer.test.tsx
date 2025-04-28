import React from "react";
import { render, screen } from "@testing-library/react";
import {
  IIIFExternalWebResource,
  InternationalString,
  Reference,
} from "@iiif/presentation-3";
import ImageViewer from "src/components/Scroll/Figure/ImageViewer";

const thumbnailBody: Reference<"ContentResource">[] = [
  {
    id: "https://example.com/iiif/2/image/example.jpg",
    type: "ContentResource",
  },
];

const iiifBody: IIIFExternalWebResource = {
  id: "https://example.com/iiif/2/image/example.jpg",
  type: "Image",
  format: "image/jpeg",
  width: 500,
  height: 500,
  service: [
    {
      id: "https://example.com/iiif/2/image",
      type: "ImageService2",
      profile: "level2",
    },
  ],
};

const label: InternationalString = {
  en: ["Test label"],
};

describe("<Thumbnail />", () => {
  it("renders the thumbnail with label as alt", () => {
    render(
      <ImageViewer
        body={iiifBody}
        thumbnail={thumbnailBody}
        display="thumbnail"
        label={label}
      />,
    );

    const thumbnail = screen.getByTestId("scroll-figure");
    expect(thumbnail).toBeInTheDocument();

    const img = thumbnail.querySelector("img");
    expect(img).toBeInTheDocument();
    expect(img).toHaveAttribute(
      "src",
      "https://example.com/iiif/2/image/example.jpg",
    );
    expect(img).toHaveAttribute("alt", "Test label");
  });
});

describe("<CloverImage />", () => {
  it("should render an OpenSeadragon instance", () => {
    render(
      <ImageViewer
        body={iiifBody}
        thumbnail={thumbnailBody}
        display="image-viewer"
      />,
    );

    expect(screen.getByTestId("scroll-figure")).toBeInTheDocument();
    expect(
      screen.getByTestId("clover-iiif-image-openseadragon-viewport"),
    ).toBeInTheDocument();
  });
});
