import { render, screen } from "@testing-library/react";

import Button from "src/components/Image/Controls/Button";
import React from "react";

const getInjectedCss = () =>
  Array.from(document.querySelectorAll("style"))
    .flatMap((style) => Array.from(style.sheet?.cssRules ?? []))
    .map((rule) => rule.cssText.replace(/\s+/g, ""))
    .join("\n");

describe("Button component", () => {
  it("renders", () => {
    render(
      <Button id="close" label="close">
        <path d="M289.94 256l95-95A24 24 0 00351 127l-95 95-95-95a24 24 0 00-34 34l95 95-95 95a24 24 0 1034 34l95-95 95 95a24 24 0 0034-34z" />
      </Button>,
    );
    const button = screen.getByTestId("openseadragon-button");
    expect(button);
    const svg = screen.getByTestId("openseadragon-button-svg");
    expect(svg);
    expect(svg.getAttribute("aria-labelledby")).toBe("close-svg-title");
    const title = svg.getElementsByTagName("title")[0];
    expect(title.getAttribute("id")).toBe("close-svg-title");
    expect(title.innerHTML.trim()).toBe("close");
  });

  it("uses the tokenized secondary color for currentColor glyphs", () => {
    render(
      <Button id="fullPage-abc" label="Fullscreen">
        <path fill="none" stroke="currentColor" d="M432 320v112H320" />
      </Button>,
    );

    const button = screen.getByTestId("openseadragon-button");
    expect(button.getAttribute("data-button")).toBe("full-page");
    expect(getInjectedCss()).toMatch(/color:var\(--colors-secondary\)/);
  });
});
