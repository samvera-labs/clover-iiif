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
import singleJson from "../fixtures/iiif-cookbook/0004-canvas-size.json";
import rtlJson from "../fixtures/iiif-cookbook/0010-book-2-viewing-direction-rtl.json";
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
          specifier === "../../parts" ||
          specifier.startsWith("./") ||
          specifier.startsWith("../shared/");
        expect(allowed, `${file} imports ${specifier}`).toBe(true);
      }
    }
  });

  it("Default: title, stage, strip with position and arrows, and the panel", async () => {
    render(<Templates.Default iiifContent={bookJson} />);
    expect(
      await screen.findByRole("heading", { name: "Simple Manifest - Book" }),
    ).toBeInTheDocument();
    expect(screen.getByText(/Item 1 of 3/)).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Next" })).toBeInTheDocument();
    expect(screen.getByRole("listbox", { name: "Items" })).toBeInTheDocument();
    // The panel's sections are stacked boxes, About open.
    expect(screen.queryByRole("tablist")).toBeNull();
    expect(screen.getByRole("button", { name: "About" })).toHaveAttribute(
      "aria-expanded",
      "true",
    );

    // Beside the stage, the toggle closes the panel; it has no close button of its own.
    const panel = document.querySelector(".clover-template-default-panel")!;
    expect(
      within(panel as HTMLElement).queryByRole("button", {
        name: "Close information panel",
      }),
    ).toBeNull();
    const toggle = screen.getByRole("button", { name: "More Information" });
    fireEvent.click(toggle);
    expect(panel).not.toBeVisible();
    expect(toggle).toHaveAttribute("aria-expanded", "false");
  });

  it("Default: the strip's arrows step the view; its header names the pages", async () => {
    render(<Templates.Default iiifContent={bookJson} />);
    const next = await screen.findByRole("button", { name: "Next" });
    // One Previous and one Next: the strip's own, with no second pair above it.
    expect(screen.getAllByRole("button", { name: "Next" })).toHaveLength(1);
    expect(next).toHaveClass("clover-items-scroll-next");
    fireEvent.click(next);
    expect(document.querySelector(".clover-pager-position")).toHaveTextContent(
      "Item 2 of 3",
    );
    const titles = document.querySelector(".clover-template-default-titles")!;
    expect(titles).toHaveTextContent("Frontispiece");
    expect(titles).toHaveTextContent("Title page");
  });

  it("Default: a right-to-left book's strip runs leftward, Previous on the right", async () => {
    render(<Templates.Default iiifContent={rtlJson} />);
    const previous = await screen.findByRole("button", { name: "Previous" });
    expect(previous.closest("[dir]")).toHaveAttribute("dir", "rtl");
  });

  describe("Default, with no room for the panel beside the stage", () => {
    // jsdom lays nothing out: a phone-wide layout, as the template measures it.
    let width: ReturnType<typeof vi.spyOn>;
    beforeEach(() => {
      width = vi
        .spyOn(HTMLElement.prototype, "clientWidth", "get")
        .mockReturnValue(390);
    });
    afterEach(() => width.mockRestore());

    const toggle = () =>
      screen.getByRole("button", { name: "More Information" });
    const panel = () =>
      document.querySelector<HTMLElement>(".clover-template-default-panel")!;

    it("never stacks: it starts closed, then slides over the stage when asked", async () => {
      render(<Templates.Default iiifContent={bookJson} />);
      await screen.findByRole("heading", { name: "Simple Manifest - Book" });
      const body = document.querySelector(".clover-template-default-body");
      expect(body).toHaveAttribute("data-panel", "over");
      expect(panel()).not.toBeVisible();
      expect(toggle()).toHaveAttribute("aria-expanded", "false");

      fireEvent.click(toggle());
      expect(panel()).toBeVisible();
      // Focus goes in, at the open box's heading: the panel covers the page.
      await waitFor(() =>
        expect(screen.getByRole("button", { name: "About" })).toHaveFocus(),
      );
      await waitFor(() => expect(panel()).toHaveAttribute("data-open", "true"));
    });

    it("closes from the uncovered strip, from Escape, and from its close button", async () => {
      render(<Templates.Default iiifContent={bookJson} />);
      await screen.findByRole("heading", { name: "Simple Manifest - Book" });
      const open = async () => {
        fireEvent.click(toggle());
        await waitFor(() =>
          expect(toggle()).toHaveAttribute("aria-expanded", "true"),
        );
      };

      await open();
      fireEvent.click(
        document.querySelector(".clover-template-default-scrim")!,
      );
      expect(toggle()).toHaveAttribute("aria-expanded", "false");

      await open();
      fireEvent.keyDown(screen.getByRole("button", { name: "About" }), {
        key: "Escape",
      });
      expect(toggle()).toHaveAttribute("aria-expanded", "false");

      await open();
      fireEvent.click(
        within(panel()).getByRole("button", {
          name: "Close information panel",
        }),
      );
      expect(toggle()).toHaveAttribute("aria-expanded", "false");
    });

    it("starts open over the stage only when the host asks", async () => {
      render(<Templates.Default iiifContent={bookJson} defaultPanelOpen />);
      await screen.findByRole("heading", { name: "Simple Manifest - Book" });
      expect(panel()).toBeVisible();
    });
  });

  it("Document: no thumbnails, bar or their toggle for a single page", async () => {
    render(<Templates.Document iiifContent={singleJson} />);
    await screen.findByRole("heading", {
      name: "Still image from an opera performance at Indiana University",
    });
    expect(screen.queryByRole("button", { name: "Show pages" })).toBeNull();
    expect(screen.queryByRole("complementary", { name: "Pages" })).toBeNull();
    expect(screen.queryByRole("separator")).toBeNull();
    expect(
      document.querySelector(".clover-template-document-body"),
    ).toHaveAttribute("data-sidebar", "closed");
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
