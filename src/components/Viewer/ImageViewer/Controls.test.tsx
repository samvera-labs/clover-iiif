import React from "react";
import { render, screen } from "@testing-library/react";
import Controls from "src/components/Viewer/ImageViewer/Controls";

describe("Controls component", () => {
  it("renders", () => {
    render(<Controls options={{}} hasPlaceholder={false} />);
    const controls = screen.getByTestId("openseadragon-controls");
    expect(controls);
  });
});
