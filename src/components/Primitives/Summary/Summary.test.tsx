import React from "react";
import { render } from "@testing-library/react";
import Summary from "src/components/Primitives/Summary/Summary";

const htmlWithinLabel = {
  none: [
    `<a href="https://en.wikipedia.org/wiki/Honey"><b>&mdash;Honey&mdash;</b></a>`,
  ],
};

const strongWithinSummary = {
  none: [
    `<a href="https://en.wikipedia.org/wiki/Honey"><strong>&mdash;Honey&mdash;</strong></a>`,
  ],
};

const disallowedHtmlWithinLabel = {
  none: [`<div style="color: gold;">the color of honey</a>`],
};

describe("summary primitive", () => {
  /**
   * test rendering of html in summary
   */
  it("Test rendering of html in summary", async () => {
    const { getByRole } = render(<Summary summary={htmlWithinLabel} />);
    const el = getByRole("link");
    expect(el.getAttribute("href")).toBe("https://en.wikipedia.org/wiki/Honey");
    expect(el).toContainHTML("<b>—Honey—</b>");
  });

  /**
   * test that strong does not render in summary
   */
  it("Test that strong does not render in summary", async () => {
    const { getByRole } = render(<Summary summary={strongWithinSummary} />);
    const el = getByRole("link");
    expect(el.getAttribute("href")).toBe("https://en.wikipedia.org/wiki/Honey");
    expect(el).toContainHTML("—Honey—");
  });

  /**
   * test sanitization of html in summary
   */
  it("Test sanitization of html in summary", async () => {
    const { getByText } = render(
      <Summary summary={disallowedHtmlWithinLabel} />,
    );
    const el = getByText("the color of honey");
    expect(el).toContainHTML("the color of honey");
  });
});
