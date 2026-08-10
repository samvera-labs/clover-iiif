import { Viewport } from "src/components/Image/Image.styled";
import { render } from "@testing-library/react";
import React from "react";

describe("Viewport styles", () => {
  it("gives the OSD canvas a visible focus-visible outline", () => {
    render(<Viewport data-testid="viewport" />);

    const css = Array.from(document.querySelectorAll("style"))
      .flatMap((style) => Array.from(style.sheet?.cssRules ?? []))
      .map((rule) => rule.cssText)
      .join("\n");

    expect(css).toMatch(/\.openseadragon-canvas:focus-visible/);
    expect(css).toMatch(/outline/);
  });
});
