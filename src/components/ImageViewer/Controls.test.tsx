import React from "react";
import { render, screen } from "@testing-library/react";
import Controls from "@/components/ImageViewer/Controls";

describe("Controls component", () => {
  it("renders", () => {
    render(<Controls />);
    const controls = screen.getByTestId("openseadragon-controls");
    expect(controls);
  });
});
