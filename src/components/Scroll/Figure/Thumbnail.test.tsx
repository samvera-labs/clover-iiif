import {
  IIIFExternalWebResource,
  InternationalString,
} from "@iiif/presentation-3";
import { render, screen } from "@testing-library/react";

import FigureThumbnail from "./Thumbnail";
import React from "react";

const body: IIIFExternalWebResource = {
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

describe("<FigureThumbnail />", () => {
  it("renders the thumbnail with label as alt", () => {
    render(<FigureThumbnail body={body} label={label} />);

    const thumbnail = screen.getByTestId("scroll-figure-thumbnail");
    expect(thumbnail).toBeInTheDocument();

    const img = thumbnail.querySelector("img");
    expect(img).toBeInTheDocument();
    expect(img).toHaveAttribute(
      "src",
      "https://example.com/iiif/2/image/full/500,500/0/default.jpg",
    );
    expect(img).toHaveAttribute("alt", "Test label");
  });

  it("renders the thumbnail without a service", () => {
    render(<FigureThumbnail body={{ ...body, service: undefined }} />);

    const img = screen.getByRole("img");
    expect(img).toBeInTheDocument();
    expect(img).toHaveAttribute(
      "src",
      "https://example.com/iiif/2/image/example.jpg",
    );
  });
});
