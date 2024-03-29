import { render, screen } from "@testing-library/react";

import Panel from "./Panel";
import React from "react";

describe("Panel", () => {
  it("should render the panel", () => {
    render(<Panel isPanelExpanded handlePanel={() => {}} />);
    expect(screen.getByTestId("scroll-panel")).toBeInTheDocument();
  });

  it("should render the panel results expanded", () => {
    render(<Panel isPanelExpanded handlePanel={() => {}} />);
    const results = screen.getByTestId("scroll-panel-results");
    expect(results).toHaveAttribute("data-panel-expanded", "true");
  });

  it("should render the panel results hidden", () => {
    render(<Panel isPanelExpanded={false} handlePanel={() => {}} />);
    const results = screen.getByTestId("scroll-panel-results");
    expect(results).toHaveAttribute("data-panel-expanded", "false");
  });
});
