import {
  fireEvent,
  render,
  screen,
  waitFor,
  within,
} from "@testing-library/react";
import { readFileSync, readdirSync, statSync } from "node:fs";
import { join, resolve } from "node:path";
import React from "react";

import bookJson from "../fixtures/iiif-cookbook/0009-book-1.json";
import { initCloverI18n } from "../i18n";
import * as Templates from "./index";

beforeEach(() => initCloverI18n({ lng: "en" }));

// jsdom has `<dialog>` but not `showModal()` or `close()`.
beforeAll(() => {
  HTMLDialogElement.prototype.showModal ??= function (this: HTMLDialogElement) {
    this.setAttribute("open", "");
  };
  HTMLDialogElement.prototype.close ??= function (this: HTMLDialogElement) {
    this.removeAttribute("open");
    this.dispatchEvent(new Event("close"));
  };
});

function sources(dir: string): string[] {
  return readdirSync(dir).flatMap((name) => {
    const path = join(dir, name);
    if (statSync(path).isDirectory()) return sources(path);
    return /\.tsx?$/.test(name) && !/\.test\./.test(name) ? [path] : [];
  });
}

describe("templates", () => {
  it("are built only from what @nulib/clover exports", () => {
    for (const file of sources(resolve(__dirname))) {
      const text = readFileSync(file, "utf8");
      for (const [, specifier] of text.matchAll(
        /^(?:import|export)\b[^;]*?from "([^"]+)"/gm,
      )) {
        const allowed =
          specifier === "react" ||
          specifier === "../../index" ||
          specifier.startsWith("./") ||
          specifier.startsWith("../shared/");
        expect(allowed, `${file} imports ${specifier}`).toBe(true);
      }
    }
  });

  it("Classic: title, stage, strip with position and arrows, and the panel", async () => {
    render(<Templates.Classic iiifContent={bookJson} />);
    expect(
      await screen.findByRole("heading", { name: "Simple Manifest - Book" }),
    ).toBeInTheDocument();
    expect(screen.getByText(/Item 1 of 3/)).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Next" })).toBeInTheDocument();
    expect(screen.getByRole("listbox", { name: "Items" })).toBeInTheDocument();
    expect(screen.getByRole("tab", { name: "About" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Share" })).toBeInTheDocument();

    const panel = document.querySelector(".clover-template-classic-panel")!;
    fireEvent.click(
      within(panel as HTMLElement).getByRole("button", {
        name: "Close information panel",
      }),
    );
    expect(panel).not.toBeVisible();
    expect(
      screen.getByRole("button", { name: "More Information" }),
    ).toHaveAttribute("aria-expanded", "false");
  });

  it("Gallery: a grid whose cells open the lightbox at that view", async () => {
    render(<Templates.Gallery iiifContent={bookJson} />);
    const options = await screen.findAllByRole("option");
    expect(document.querySelector(".clover-items")).toHaveAttribute(
      "data-layout",
      "grid",
    );
    fireEvent.click(options[1]);
    const dialog = document.querySelector("dialog")!;
    expect(
      within(dialog).getByRole("heading", { name: "Frontispiece" }),
    ).toBeInTheDocument();
    expect(within(dialog).getByText(/Item 2 of 3/)).toBeInTheDocument();
    fireEvent.click(within(dialog).getByRole("button", { name: "Close" }));
    expect(dialog.querySelector(".clover-content")).toBeNull();
  });

  it("Document: toolbar, thumbnails, a page the wheel turns, and a sliding panel", async () => {
    render(<Templates.Document iiifContent={bookJson} />);
    expect(
      await screen.findByRole("heading", { name: "Simple Manifest - Book" }),
    ).toBeInTheDocument();
    const sidebar = screen.getByRole("complementary", { name: "Pages" });
    const toggle = screen.getByRole("button", { name: "Show pages" });
    expect(toggle).toHaveAttribute("aria-expanded", "true");
    expect(within(sidebar).getAllByRole("option")).toHaveLength(3);

    const stage = document.querySelector(".clover-template-document-stage")!;
    const canvas = stage.querySelector('[data-testid="clover-canvas"]');
    stage.dispatchEvent(
      new WheelEvent("wheel", { deltaY: 100, bubbles: true, cancelable: true }),
    );
    await waitFor(() =>
      expect(
        document.querySelector(".clover-pager-position"),
      ).toHaveTextContent("Item 2 of 3"),
    );
    // The turn swapped the page into the same Canvas: nothing remounted.
    expect(stage.querySelector('[data-testid="clover-canvas"]')).toBe(canvas);

    const panel = document.querySelector(".clover-template-document-panel")!;
    expect(panel).toHaveAttribute("hidden");
    fireEvent.click(screen.getByRole("button", { name: "More Information" }));
    expect(panel).not.toHaveAttribute("hidden");
    await waitFor(() => expect(panel).toHaveAttribute("data-open", "true"));
    expect(
      within(panel as HTMLElement).getByRole("tab", { name: "About" }),
    ).toBeInTheDocument();

    // Opening takes focus into the panel; Escape there hands it back to the toggle.
    const about = within(panel as HTMLElement).getByRole("tab", {
      name: "About",
    });
    await waitFor(() => expect(about).toHaveFocus());
    fireEvent.keyDown(about, { key: "Escape" });
    expect(panel).toHaveAttribute("data-open", "false");
    expect(
      screen.getByRole("button", { name: "More Information" }),
    ).toHaveFocus();
    await waitFor(() => expect(panel).toHaveAttribute("hidden"));

    // And its close button.
    fireEvent.click(screen.getByRole("button", { name: "More Information" }));
    fireEvent.click(
      within(panel as HTMLElement).getByRole("button", {
        name: "Close information panel",
      }),
    );
    expect(panel).toHaveAttribute("data-open", "false");

    fireEvent.click(toggle);
    expect(sidebar).toHaveAttribute("hidden");
  });

  it("Text: an article per Canvas, its text by language, Markdown read", async () => {
    const manifest = {
      "@context": "http://iiif.io/api/presentation/3/context.json",
      id: "https://example.org/letter",
      type: "Manifest",
      label: { en: ["A letter"] },
      items: [1, 2].map((n) => ({
        id: `https://example.org/letter/canvas/${n}`,
        type: "Canvas",
        label: { en: [`Page ${n}`] },
        width: 100,
        height: 100,
        items: [],
        annotations: [
          {
            id: `https://example.org/letter/canvas/${n}/page`,
            type: "AnnotationPage",
            items: [
              {
                id: `https://example.org/letter/canvas/${n}/en`,
                type: "Annotation",
                motivation: "supplementing",
                body: {
                  type: "TextualBody",
                  language: "en",
                  format: "text/markdown",
                  value: n === 1 ? "*Dear* friend" : "Yours truly",
                },
                target: `https://example.org/letter/canvas/${n}`,
              },
              {
                id: `https://example.org/letter/canvas/${n}/fr`,
                type: "Annotation",
                motivation: "supplementing",
                body: {
                  type: "TextualBody",
                  language: "fr",
                  value: n === 1 ? "Cher ami" : "Bien à vous",
                },
                target: `https://example.org/letter/canvas/${n}`,
              },
            ],
          },
        ],
      })),
    };
    render(<Templates.Text iiifContent={manifest} />);
    const articles = await screen.findAllByRole("article");
    expect(articles).toHaveLength(2);
    expect(articles[0]).toHaveAccessibleName("Page 1");
    const french = articles[0].querySelector('[lang="fr"]');
    expect(french).toHaveTextContent("Cher ami");
    await waitFor(() =>
      expect(articles[0].querySelector("i")).toHaveTextContent("Dear"),
    );

    fireEvent.change(screen.getByRole("searchbox", { name: "Search" }), {
      target: { value: "truly" },
    });
    expect(screen.getAllByRole("article")).toHaveLength(1);
    expect(screen.getByText("1 / 2")).toHaveAttribute("role", "status");
  });
});
