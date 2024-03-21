import { render, screen } from "@testing-library/react";

import Button from "src/components/Image/Controls/Button";
import React from "react";

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
});
