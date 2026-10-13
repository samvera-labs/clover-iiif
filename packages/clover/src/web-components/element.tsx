import React from "react";
import { type Root as ReactRoot, createRoot } from "react-dom/client";

import { Viewer } from "../components/Viewer/Viewer";
import type { ViewerProps } from "../components/Viewer/Viewer";
import { Default } from "../templates/default/Default";
import { setMapWorkerUrl } from "../core/map-config";
import type { IIIFContent } from "../core/load";

/**
 * `<clover-viewer>`: Clover's Viewer as a custom element, for a page with no React of its
 * own. Rendered into the element's light DOM (no shadow root), so the page's CSS still
 * reaches it, as 3.x's element does.
 *
 *   <clover-viewer iiif-content="https://example.org/manifest.json"></clover-viewer>
 *
 * Attributes: `iiif-content`, `canvas-id` (the Canvas to open on), `manifest-id`,
 * `language`, `search-query`, and `items`, `panel`, `download` (`"false"` turns one
 * off; `items` also takes `carousel`, `list` or `grid`). The `iiifContent` property takes
 * an object too. Events: `canvaschange`, `manifestchange`, `contentstatechange`, each
 * with its value in `detail`.
 */

export interface ElementAssets {
  /** Clover's stylesheet, injected once per document. */
  styles: string;
  /** MapLibre's stylesheet, injected the first time a map is shown. */
  mapStyles?: () => Promise<string>;
  /** Where MapLibre's worker is served from (the build emits it beside the element). */
  mapWorkerUrl?: string;
}

const STRINGS = {
  "iiif-content": "iiifContent",
  "canvas-id": "defaultCanvasId",
  "manifest-id": "manifestId",
  language: "language",
  "search-query": "searchQuery",
} as const;
const SWITCHES = ["header", "panel", "download"] as const;

const injected = new WeakMap<Document, Set<string>>();

/** Put a stylesheet in the document once, first in `<head>` so the page's own CSS wins. */
function inject(doc: Document, key: string, css: string) {
  let done = injected.get(doc);
  if (!done) injected.set(doc, (done = new Set()));
  if (done.has(key)) return;
  done.add(key);
  const style = doc.createElement("style");
  style.dataset.clover = key;
  style.textContent = css;
  doc.head.prepend(style);
}

/** Define `<clover-viewer>` (once), with the assets the build hands it. */
export function defineCloverViewer(assets: ElementAssets): void {
  if (typeof customElements === "undefined") return;
  if (customElements.get("clover-viewer")) return;
  if (assets.mapWorkerUrl) setMapWorkerUrl(assets.mapWorkerUrl);

  class CloverViewerElement extends HTMLElement {
    static get observedAttributes() {
      return [...Object.keys(STRINGS), "items", ...SWITCHES];
    }

    private root: ReactRoot | null = null;
    private content: IIIFContent | null = null;
    private observer: MutationObserver | null = null;

    /** The content to show: a URL, or a IIIF object (which an attribute cannot carry). */
    get iiifContent(): IIIFContent | null {
      return this.content ?? this.getAttribute("iiif-content");
    }
    set iiifContent(value: IIIFContent | null) {
      this.content = value;
      this.update();
    }

    connectedCallback() {
      inject(this.ownerDocument, "clover", assets.styles);
      this.watchForMap();
      this.root ??= createRoot(this);
      this.update();
    }

    disconnectedCallback() {
      // Moved within the page, it reconnects at once; only a removal tears it down.
      queueMicrotask(() => {
        if (this.isConnected) return;
        this.observer?.disconnect();
        this.observer = null;
        this.root?.unmount();
        this.root = null;
      });
    }

    attributeChangedCallback() {
      this.update();
    }

    /** MapLibre's stylesheet, the first time a map appears in any element. */
    private watchForMap() {
      const { mapStyles } = assets;
      if (!mapStyles || this.observer) return;
      const doc = this.ownerDocument;
      this.observer = new MutationObserver(() => {
        if (!this.querySelector(".clover-geomap")) return;
        this.observer?.disconnect();
        void mapStyles().then((css) => inject(doc, "maplibre", css));
      });
      this.observer.observe(this, { childList: true, subtree: true });
    }

    private emit(type: string, detail: unknown) {
      this.dispatchEvent(new CustomEvent(type, { detail, bubbles: true }));
    }

    private update() {
      const content = this.iiifContent;
      if (!this.root || !content) return;
      const props: Record<string, unknown> = {};
      for (const [attribute, prop] of Object.entries(STRINGS)) {
        const value = this.getAttribute(attribute);
        if (value) props[prop] = value;
      }
      const items = this.getAttribute("items");
      if (items) props.items = items === "false" ? false : items;
      for (const name of SWITCHES) {
        if (this.getAttribute(name) === "false") props[name] = false;
      }
      this.root.render(
        <Viewer
          {...(props as Partial<ViewerProps>)}
          // Up front: the element is one build, and always draws Default.
          template={Default}
          iiifContent={content}
          onCanvasChange={(canvasId) => this.emit("canvaschange", { canvasId })}
          onManifestChange={(manifestId) =>
            this.emit("manifestchange", { manifestId })
          }
          onContentStateChange={(state) =>
            this.emit("contentstatechange", state)
          }
        />,
      );
    }
  }

  customElements.define("clover-viewer", CloverViewerElement);
}
