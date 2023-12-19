import { render, screen } from "@testing-library/react";

import PaintingPlaceholder from "./Placeholder";
import React from "react";

const props = {
  isMedia: false,
  label: { en: ["label"] },
  placeholderCanvas: "foobar",
  setIsInteractive: vi.fn(),
};

describe("PaintingPlaceholder", () => {
  test("renders an element with the 'clover-viewer-placeholder' class name", () => {
    render(<PaintingPlaceholder {...props} />);
    expect(screen.getByRole("button")).toHaveClass("clover-viewer-placeholder");
  });
});
