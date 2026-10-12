import { fireEvent, render, screen, within } from "@testing-library/react";
import React from "react";

import bookJson from "../../fixtures/iiif-cookbook/0009-book-1.json";
import renderingJson from "../../fixtures/iiif-cookbook/0046-rendering.json";
import { initCloverI18n } from "../../i18n";
import * as Clover from "../../index";

beforeEach(() => initCloverI18n({ lng: "en" }));

/** Cookbook 0046 with a page of its own given a rendering too. */
const withPage = {
  ...renderingJson,
  items: renderingJson.items.map((canvas, index) =>
    index === 0
      ? {
          ...canvas,
          rendering: [
            {
              id: "https://example.org/page-1.jpg",
              type: "Image",
              label: { en: ["Full-size image"] },
              format: "image/jpeg",
            },
          ],
        }
      : canvas,
  ),
};

describe("Download", () => {
  it("lists the page's and the Manifest's renderings, as links, behind one button", async () => {
    render(
      <Clover.Root iiifContent={withPage}>
        <Clover.Download />
      </Clover.Root>,
    );
    const button = await screen.findByRole("button", { name: "Download" });
    expect(button).toHaveAttribute("aria-expanded", "false");
    fireEvent.click(button);
    expect(button).toHaveAttribute("aria-expanded", "true");

    const page = screen.getByRole("region", { name: "This page" });
    expect(
      within(page).getByRole("link", { name: /Full-size image/ }),
    ).toHaveAttribute("href", "https://example.org/page-1.jpg");
    const all = screen.getByRole("region", { name: "All pages" });
    const pdf = within(all).getByRole("link", { name: /PDF version/ });
    expect(pdf).toHaveAttribute(
      "href",
      "https://fixtures.iiif.io/other/UCLA/kabuki_ezukushi_rtl.pdf",
    );
    expect(pdf).toHaveTextContent("(application/pdf)");
    expect(pdf).toHaveAttribute("target", "_blank");
  });

  it("closes on Escape, handing focus back, and on a press outside", async () => {
    render(
      <Clover.Root iiifContent={renderingJson}>
        <p>Elsewhere</p>
        <Clover.Download />
      </Clover.Root>,
    );
    const button = await screen.findByRole("button", { name: "Download" });
    fireEvent.click(button);
    fireEvent.keyDown(screen.getByRole("link", { name: /PDF version/ }), {
      key: "Escape",
    });
    expect(button).toHaveAttribute("aria-expanded", "false");
    expect(button).toHaveFocus();

    fireEvent.click(button);
    fireEvent.pointerDown(screen.getByText("Elsewhere"));
    expect(button).toHaveAttribute("aria-expanded", "false");
  });

  it("renders nothing with nothing to download", async () => {
    render(
      <Clover.Root iiifContent={bookJson}>
        <Clover.Label as="h1" />
        <Clover.Download />
      </Clover.Root>,
    );
    await screen.findByRole("heading");
    expect(screen.queryByRole("button", { name: "Download" })).toBeNull();
  });

  it("lists the same downloads in About, under a Download heading", async () => {
    render(
      <Clover.Root iiifContent={withPage}>
        <Clover.About />
      </Clover.Root>,
    );
    const heading = await screen.findByRole("heading", { name: "Download" });
    const section = heading.closest("section")!;
    expect(
      within(section).getByRole("heading", { name: "This page", level: 4 }),
    ).toBeInTheDocument();
    expect(
      within(section).getByRole("link", { name: /Full-size image/ }),
    ).toHaveAttribute("href", "https://example.org/page-1.jpg");
    expect(
      within(section).getByRole("link", { name: /PDF version/ }),
    ).toHaveAttribute(
      "href",
      "https://fixtures.iiif.io/other/UCLA/kabuki_ezukushi_rtl.pdf",
    );
    // About has no button of its own: the links are listed, not behind Download's.
    expect(screen.queryByRole("button", { name: "Download" })).toBeNull();
  });
});
