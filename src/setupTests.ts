import "@testing-library/jest-dom/vitest";

import { afterEach } from "vitest";
import { cleanup } from "@testing-library/react";

// Mock canvas
HTMLCanvasElement.prototype.getContext = () => {
  return {} as any;
};

// Mock HTML video element
HTMLMediaElement.prototype.load = () => {};
//HTMLMediaElement.prototype.play = () => { /* do nothing */ };
HTMLMediaElement.prototype.pause = () => {};
//HTMLMediaElement.prototype.addTextTrack = () => { /* do nothing */ };

// runs a cleanup after each test case (e.g. clearing jsdom)
afterEach(() => {
  cleanup();
});
