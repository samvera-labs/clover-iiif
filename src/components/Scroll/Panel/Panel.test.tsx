import { render, screen } from "@testing-library/react";

import Panel from "./Panel";
import React from "react";

describe("Panel", () => {
  it("should render the panel", () => {
    render(<Panel width={1000} isFixed={false} />);

    const panel = screen.getByTestId("scroll-panel");
    expect(panel).toBeInTheDocument();

    const panelResults = screen.getByTestId("scroll-panel-results");
    expect(panelResults).toBeInTheDocument();
    expect(panelResults).toHaveAttribute("data-panel-expanded", "false");

    const searchForm = screen.getByTestId("scroll-panel-search-form");
    expect(searchForm).toBeInTheDocument();

    expect(panel).toHaveStyle(`
      left: calc(1000px - 2rem);
      width: 2rem;
    `);
  });

  it("should adjust styles if isFixed ", () => {
    render(<Panel width={1000} isFixed={true} />);

    const panel = screen.getByTestId("scroll-panel");
    expect(panel).toBeInTheDocument();

    expect(panel).toHaveStyle(`
      position: fixed;
      top: 0;
    `);
  });
});
