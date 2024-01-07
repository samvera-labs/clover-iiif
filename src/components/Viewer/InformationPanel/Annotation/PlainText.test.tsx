import { render, screen } from "@testing-library/react";

import AnnotationItemPlainText from "./PlainText";
import React from "react";

describe("AnnotationItemPlainText", () => {
  it("should render the component", () => {
    render(<AnnotationItemPlainText value="Hello" handleClick={() => {}} />);
    expect(screen.getByText("Hello")).toBeInTheDocument();
  });

  it("should handle the click event", () => {
    const handleClick = vitest.fn();
    render(<AnnotationItemPlainText value="Hello" handleClick={handleClick} />);
    screen.getByText("Hello").click();
    expect(handleClick).toHaveBeenCalled();
  });
});
