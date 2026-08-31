import { render, screen } from "@testing-library/react";

import Button from "src/components/Image/Controls/Button";
import React from "react";
import fs from "node:fs";
import path from "node:path";

/*
 * The glyph colours used to be asserted against Stitches' injected CSSOM. They live in
 * Button.css now, which no test renderer loads, so the file is read directly. What the
 * element carries — the class the stylesheet keys on — is asserted on the rendered button,
 * so the two halves together still cover the contract.
 */
const css = fs.readFileSync(path.join(__dirname, "Button.css"), "utf-8");

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
    // The class is what connects the element to the rules asserted below.
    expect(button).toHaveClass("clover-iiif-image-openseadragon-button");
    expect(css).toMatch(
      /:focus \{\s*background-color: var\(--clover-color-accent/,
    );
    expect(css).toMatch(/color: var\(--clover-color-secondary/);
  });

  /*
   * `data-button` is derived from the id specifically so these selectors do not depend on a
   * localized label. If the derivation or the selectors drift apart the nudge silently
   * stops happening, which is invisible in a screenshot.
   */
  it("keys the rotate nudges on data-button, not on the localized id", () => {
    render(
      <Button id="rotateRight-abc" label="Rotate right">
        <path d="M0 0" />
      </Button>,
    );

    expect(screen.getByTestId("openseadragon-button")).toHaveAttribute(
      "data-button",
      "rotate-right",
    );
    expect(css).toMatch(/\[data-button="rotate-right"\]:hover svg/);
  });
});
