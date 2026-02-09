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

  it("renders newline characters as line breaks", () => {
    const { container } = render(
      <AnnotationItemPlainText
        value={`Line 1\nLine 2\nLine 3`}
        handleClick={() => {}}
      />,
    );

    const lineBreaks = container.querySelectorAll("br");
    expect(lineBreaks).toHaveLength(2);
    expect(screen.getByText("Line 1", { exact: false })).toBeInTheDocument();
  });
});
