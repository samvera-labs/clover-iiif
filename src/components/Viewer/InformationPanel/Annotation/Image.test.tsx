import { render, screen } from "@testing-library/react";

import AnnotationItemImage from "./Image";
import React from "react";

const props = {
  caption: "Foo bar",
  handleClick: vitest.fn(),
  imageUri: "https://example.com/image.jpg",
};

describe("AnnotationItemImage", () => {
  it("should render the Image and text caption", () => {
    render(<AnnotationItemImage {...props} />);
    expect(screen.getByText("Foo bar")).toBeInTheDocument();
    const imageEl = screen.getByAltText(
      `A visual annotation for ${props.caption}`,
    );
    expect(imageEl).toHaveAttribute("src", props.imageUri);
  });

  it("should handle the click event", () => {
    render(<AnnotationItemImage {...props} />);
    screen.getByText("Foo bar").click();
    expect(props.handleClick).toHaveBeenCalledOnce();
  });
});
