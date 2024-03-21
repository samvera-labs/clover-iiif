import { render, screen } from "@testing-library/react";

import OSD from "./OSD";
import { OpenSeadragonImageTypes } from "src/types/open-seadragon";
import React from "react";
import defaultOpenSeadragonConfiguration from "./defaults";

const instanceId = "abcdegh";
const config = defaultOpenSeadragonConfiguration(instanceId);

describe("OSD", () => {
  it("renders OpenSeadragon", () => {
    render(
      <OSD
        _cloverViewerHasPlaceholder={false}
        ariaLabel="My aria label"
        config={config}
        imageType={OpenSeadragonImageTypes.SimpleImage}
        uri="https://example.com/image.jpg"
      />,
    );
    const osd = screen.getByTestId("clover-iiif-image-openseadragon");
    expect(osd).toHaveClass("clover-iiif-image-openseadragon");
    expect(osd).toHaveAttribute(
      "data-openseadragon-instance",
      `openseadragon-${instanceId}`,
    );

    const osdViewport = screen.getByTestId(
      "clover-iiif-image-openseadragon-viewport",
    );
    expect(osdViewport).toHaveAttribute("role", "img");
    expect(osdViewport).toHaveAttribute("aria-label", "My aria label");
  });
});
