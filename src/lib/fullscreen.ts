/**
 * The Fullscreen API, with Safari's prefixes and a way to find Clover's own root.
 *
 * Clover used to reach full screen through OpenSeadragon's `setFullPage()`, which is not the
 * Fullscreen API at all: it sets `display: none` on every child of `<body>` except its own
 * viewport element and reparents that element to the body. Everything else Clover draws —
 * the header, the image controls, the thumbnail rail, the information panel — are siblings of
 * that element, so they all disappeared. The rail only survived because it was portalled to
 * the body on purpose, and the controls could not be: OpenSeadragon binds them by element id
 * at init, so re-rendering them anywhere else leaves it holding a detached node.
 *
 * Asking the browser to full-screen Clover's own root instead keeps the whole component on
 * screen, because it never leaves the tree. OpenSeadragon simply resizes into its container.
 */

type PrefixedElement = HTMLElement & {
  webkitRequestFullscreen?: () => Promise<void> | void;
};

type PrefixedDocument = Document & {
  webkitFullscreenElement?: Element | null;
  webkitExitFullscreen?: () => Promise<void> | void;
};

/** The element currently full screen, if any. */
export const getFullscreenElement = (): Element | null => {
  if (typeof document === "undefined") return null;
  const doc = document as PrefixedDocument;
  return doc.fullscreenElement ?? doc.webkitFullscreenElement ?? null;
};

export const isFullscreenSupported = (): boolean => {
  if (typeof document === "undefined") return false;
  const doc = document as PrefixedDocument;
  return Boolean(doc.fullscreenEnabled ?? doc.webkitExitFullscreen);
};

/**
 * Clover's root, found from an element inside it.
 *
 * `.clover-viewer` is checked first on purpose. Both selectors match when an `Image` is
 * nested in a `Viewer`, and the image wrapper is the nearer ancestor — so a plain
 * `closest()` over both would full-screen the image alone and leave the rest of the viewer
 * behind, which is the problem this is here to solve.
 */
export const getCloverRoot = (from: Element | null): HTMLElement | null =>
  (from?.closest(".clover-viewer") as HTMLElement | null) ??
  (from?.closest(".clover-iiif-image-openseadragon") as HTMLElement | null);

/**
 * Enter or leave full screen for the Clover root containing `from`.
 *
 * Must be called from within a user gesture — browsers reject a request that is not, and they
 * reject it silently enough that routing it through state and an effect can lose it.
 *
 * A refusal is swallowed rather than left to surface as an unhandled promise rejection. A
 * browser may decline for reasons that have nothing to do with the click: a permissions
 * policy, an embedded frame that was never allowed full screen.
 */
export const toggleFullscreen = async (from: Element | null) => {
  const root = getCloverRoot(from);
  if (!root) return;

  try {
    if (getFullscreenElement()) {
      const doc = document as PrefixedDocument;
      await (doc.exitFullscreen?.() ?? doc.webkitExitFullscreen?.());
      return;
    }

    const element = root as PrefixedElement;
    await (element.requestFullscreen?.() ??
      element.webkitRequestFullscreen?.());
  } catch {
    // Declined. Nothing to undo — the reader stays where they were.
  }
};
