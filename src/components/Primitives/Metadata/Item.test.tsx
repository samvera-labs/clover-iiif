import { render, screen } from "@testing-library/react";

import Item from "src/components/Primitives/Metadata/Item";
import { PrimitivesProvider } from "src/context/primitives-context";
import React from "react";
import { customValueContent } from "src/fixtures/custom";

const htmlWithinMetadataItem = {
  label: { none: ["Type"] },
  value: {
    none: [`<a href="https://en.wikipedia.org/wiki/Honey"><b>Honey</b></a>`],
  },
};

const strongWithinMetadataItem = {
  label: { none: ["Type"] },
  value: {
    none: [
      `<a href="https://en.wikipedia.org/wiki/Honey"><strong>Honey</strong></a>`,
    ],
  },
};

const htmlWithinLabel = {
  label: {
    none: [`<a href="https://en.wikipedia.org/wiki/Type"><b>Type</b></a>`],
  },
  value: {
    none: [`Honey`],
  },
};

const itemForCustomValue = {
  label: {
    none: [`Subject`],
  },
  value: {
    none: [`Honey`],
  },
};

describe("metadata primitive (item)", () => {
  function withProvider(Component: React.ReactNode) {
    return <PrimitivesProvider>{Component}</PrimitivesProvider>;
  }
  /**
   * test rendering of html in metadata value
   */
  it("Test rendering of html in metadata value", async () => {
    const { getByRole } = render(
      withProvider(<Item item={htmlWithinMetadataItem} />),
    );
    const el = getByRole("link");
    expect(el.getAttribute("href")).toBe("https://en.wikipedia.org/wiki/Honey");
    expect(el).toContainHTML("<b>Honey</b>");
  });

  /**
   * test that strong does not render in metadata value
   */
  it("Test that strong does not render in metadata value", async () => {
    const { getByRole } = render(
      withProvider(<Item item={strongWithinMetadataItem} />),
    );
    const el = getByRole("link");
    expect(el.getAttribute("href")).toBe("https://en.wikipedia.org/wiki/Honey");
    expect(el).toContainHTML("Honey");
  });

  /**
   * test rendering not rendering HTML markup for label
   */
  it("Test rendering not rendering HTML markup for label", async () => {
    render(withProvider(<Item item={htmlWithinLabel} />));
    const el = screen.queryByText("Type");
    expect(el).toBeNull;
  });

  /**
   * Test passing customValueContent
   */
  it("Test passing customValueContent", () => {
    render(
      withProvider(
        <Item
          item={itemForCustomValue}
          customValueContent={customValueContent[1].Content}
        />,
      ),
    );
    const el = screen.queryByRole("link");
    expect(el).toContainHTML(
      "<a href='https://example.org/?subject=Honey'>Honey</a>",
    );
  });
});
