import React from "react";
import { render, screen } from "@testing-library/react";
import RequiredStatement from "src/components/Primitives/RequiredStatement/RequiredStatement";

const htmlWithinRequiredStatement = {
  label: { none: ["Type"] },
  value: {
    none: [
      `<a href="https://en.wikipedia.org/wiki/Honey"><b>&mdash;Honey&mdash;</b></a>`,
    ],
  },
};

const htmlWithinRequiredStatementLabel = {
  label: { none: ["<b>Type</b>"] },
  value: {
    none: [
      `<a href="https://en.wikipedia.org/wiki/Honey">&mdash;Honey&mdash;</a>`,
    ],
  },
};

const strongWithinRequiredStatement = {
  label: { none: ["Type"] },
  value: {
    none: [
      `<a href="https://en.wikipedia.org/wiki/Honey"><strong>&mdash;Honey&mdash;</strong></a>`,
    ],
  },
};

const disallowedHtmlWithinRequiredStatement = {
  label: { none: ["Type"] },
  value: {
    none: [`<div style="color: gold;">the color of honey</a>`],
  },
};

describe("summary primitive", () => {
  /**
   * tests rendering of html in RequiredStatement
   */
  it("Test rendering of html in RequiredStatement", async () => {
    const { getByRole } = render(
      <RequiredStatement requiredStatement={htmlWithinRequiredStatement} />
    );
    const el = getByRole("link");
    expect(el.getAttribute("href")).toBe("https://en.wikipedia.org/wiki/Honey");
    expect(el).toContainHTML("<b>—Honey—</b>");
  });

  /**
   * tests rendering of html in RequiredStatement Label
   */
  it("Test rendering of html in RequiredStatement Label", async () => {
    const { getByRole } = render(
      <RequiredStatement requiredStatement={htmlWithinRequiredStatementLabel} />
    );
    const el = screen.queryByText("Type");
    expect(el).toBeNull;
  });

  /**
   * tests that strong does not render in RequiredStatement
   */
  it("Tests that strong does not render in RequiredStatement", async () => {
    const { getByRole } = render(
      <RequiredStatement requiredStatement={strongWithinRequiredStatement} />
    );
    const el = getByRole("link");
    expect(el.getAttribute("href")).toBe("https://en.wikipedia.org/wiki/Honey");
    expect(el).toContainHTML("—Honey—");
  });

  /**
   * test sanitization of html in RequiredStatement
   */
  it("Test sanitization of html in RequiredStatement", async () => {
    const { getByText } = render(
      <RequiredStatement
        requiredStatement={disallowedHtmlWithinRequiredStatement}
      />
    );
    const el = getByText("the color of honey");
    expect(el).toContainHTML("the color of honey");
  });
});
