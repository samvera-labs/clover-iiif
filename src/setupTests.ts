import "@testing-library/jest-dom/vitest";

import { afterEach } from "vitest";
import { cleanup } from "@testing-library/react";

// Mock canvas
HTMLCanvasElement.prototype.getContext = () => {
  return {} as any;
};

/*
 * Mock matchMedia — jsdom does not implement it.
 *
 * Required as of OpenSeadragon 6: its default drawer is `auto`, and the resolver calls
 * `window.matchMedia('(pointer: coarse)')` unguarded to decide whether it is on an
 * iPad-like device (which gets the canvas drawer instead of WebGL). Every viewer
 * construction reaches it, so without this every OSD-mounting test throws
 * "window.matchMedia is not a function".
 *
 * `matches: false` presents a fine-pointer desktop, which is the right default for the
 * suite. Clover's own callers already guard for a missing matchMedia; OpenSeadragon's
 * does not.
 */
window.matchMedia = ((query: string) => ({
  matches: false,
  media: query,
  onchange: null,
  addListener: () => {},
  removeListener: () => {},
  addEventListener: () => {},
  removeEventListener: () => {},
  dispatchEvent: () => false,
})) as unknown as typeof window.matchMedia;

// Mock HTML video element
HTMLMediaElement.prototype.load = () => {};
//HTMLMediaElement.prototype.play = () => { /* do nothing */ };
HTMLMediaElement.prototype.pause = () => {};
//HTMLMediaElement.prototype.addTextTrack = () => { /* do nothing */ };

// Mock ResizeObserver
global.ResizeObserver = class ResizeObserver {
  observe() {
    // do nothing
  }
  unobserve() {
    // do nothing
  }
  disconnect() {
    // do nothing
  }
};

class MockIntersectionObserver {
  constructor(callback: any) {
    this.callback = callback;
  }

  readonly callback: any;

  observe = vi.fn();
  unobserve = vi.fn();
  disconnect = vi.fn();
  takeRecords = vi.fn();
}

globalThis.IntersectionObserver = MockIntersectionObserver as any;

// runs a cleanup after each test case (e.g. clearing jsdom)
afterEach(() => {
  cleanup();
});
