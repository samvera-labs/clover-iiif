import { render, screen } from "@testing-library/react";

import Controls from "src/components/Image/Controls/Controls";
import React from "react";

describe("Controls component", () => {
  it("renders", () => {
    render(<Controls config={{}} _cloverViewerHasPlaceholder={false} />);
    const controls = screen.getByTestId(
      "clover-iiif-image-openseadragon-controls",
    );
    expect(controls);
  });
});
