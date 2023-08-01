import React from "react";
import { render } from "@testing-library/react";
import Markup from "src/components/Primitives/Markup/Markup";

const htmlWithinLabel = {
  none: [
    `<a href="https://en.wikipedia.org/wiki/Honey"><b>&mdash;Honey&mdash;</b></a>`,
  ],
};

const strongWithinLabel = {
  none: [
    `<a href="https://en.wikipedia.org/wiki/Honey"><strong>&mdash;Honey&mdash;</strong></a>`,
  ],
};

const disallowedHtmlWithinLabel = {
  none: [`<div style="color: gold;">the color of honey</a>`],
};

describe("markup and sanitization", () => {
  /**
   * test rendering of html
   */
  it("Tests rendering of HTML for markup.", async () => {
    const { getByRole } = render(<Markup markup={htmlWithinLabel} />);
    const el = getByRole("link");
    expect(el.getAttribute("href")).toBe("https://en.wikipedia.org/wiki/Honey");
    expect(el).toContainHTML("<b>—Honey—</b>");
  });

  /**
   * test rendering of strong
   */
  it("Tests that strong does not render for markup.", async () => {
    const { getByRole } = render(<Markup markup={strongWithinLabel} />);
    const el = getByRole("link");
    expect(el.getAttribute("href")).toBe("https://en.wikipedia.org/wiki/Honey");
    expect(el).toContainHTML("—Honey—");
  });

  /**
   * test sanitization of html
   */
  it("Tests sanitizations of HTML within for markup.", async () => {
    const { getByText } = render(<Markup markup={disallowedHtmlWithinLabel} />);
    const el = getByText("the color of honey");
    expect(el).toContainHTML("the color of honey");
  });
});
