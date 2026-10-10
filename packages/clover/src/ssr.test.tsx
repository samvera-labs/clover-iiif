// @vitest-environment node
import React from "react";
import { renderToString } from "react-dom/server";

import bookJson from "./fixtures/iiif-cookbook/0009-book-1.json";
import * as Clover from "./index";
import * as Templates from "./templates";
import { Map } from "./map";

/*
 * Server rendering: no DOM, no window. Every entry must import and render to a string
 * without touching the browser; the content loads once the page hydrates.
 */
describe("server rendering", () => {
  it("has no browser to touch", () => {
    expect(typeof window).toBe("undefined");
    expect(typeof document).toBe("undefined");
  });

  it("renders a Root with Label, Items and Content from object content", () => {
    const html = renderToString(
      <Clover.Root iiifContent={bookJson}>
        <Clover.Label as="h1" />
        <Clover.Content />
        <Clover.Items />
        <Clover.InformationPanel />
      </Clover.Root>,
    );
    expect(html).toContain("clover-root");
    expect(html).toContain("clover-content");
  });

  it("renders the Viewer, every template, and the Map", () => {
    for (const element of [
      <Clover.Viewer key="v" iiifContent={bookJson} />,
      <Templates.Classic key="c" iiifContent={bookJson} />,
      <Templates.Document key="d" iiifContent={bookJson} />,
      <Templates.Gallery key="g" iiifContent={bookJson} />,
      <Templates.Text key="t" iiifContent={bookJson} />,
      <Map key="m" iiifContent={bookJson} />,
    ]) {
      expect(() => renderToString(element)).not.toThrow();
    }
  });

  it("renders standalone parts outside a Root", () => {
    const html = renderToString(
      <>
        <Clover.Label label={{ en: ["A label"] }} />
        <Clover.Items
          iiifContent={{
            "@context": "http://iiif.io/api/presentation/3/context.json",
            id: "https://example.org/shelf",
            type: "Collection",
            label: { en: ["Shelf"] },
            items: [
              { id: bookJson.id, type: "Manifest", label: bookJson.label },
            ],
          }}
        />
        <Clover.Canvas src="https://example.org/image.jpg" />
      </>,
    );
    expect(html).toContain("A label");
  });
});
