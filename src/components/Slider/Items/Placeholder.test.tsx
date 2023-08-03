import { render, screen } from "@testing-library/react";

import Placeholder from "./Placeholder";
import React from "react";

describe("SliderItemPlaceholder component", () => {
  test("renders", () => {
    render(<Placeholder backgroundImage="test.jpg" />);
    screen.debug();
    expect(screen.getByTestId("slider-item-placeholder")).toBeInTheDocument();
  });
});
