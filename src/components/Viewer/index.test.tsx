import { cleanup, render } from "@testing-library/react";
import React from "react";
import CloverViewer from "src/components/Viewer";
import { ViewerProvider } from "src/context/viewer-context";

vi.mock("src/context/viewer-context", async () => {
  const actual = await vi.importActual<
    typeof import("src/context/viewer-context")
  >("src/context/viewer-context");
  return {
    ...actual,
    ViewerProvider: vi.fn(actual.ViewerProvider),
  };
});

describe("Viewer", () => {
  afterEach(() => {
    cleanup();
    vi.mocked(ViewerProvider).mockClear();
  });

  test("gives each mounted instance its own viewerId", () => {
    // Two separate mounts are enough to reproduce this: the bug was that
    // `defaultState` is computed once, at module load, so every instance that
    // does not explicitly override `viewerId` inherits the exact same one —
    // whether the two instances are ever simultaneously on screen or not.
    render(<CloverViewer iiifContent="https://example.org/manifest/a.json" />);
    // `ViewerProvider`'s `initialState` prop only seeds `useReducer` on this
    // first call; later re-renders from internal effects still pass a prop,
    // but React ignores it after mount, so the first call is the one that
    // matters here.
    const firstViewerId =
      vi.mocked(ViewerProvider).mock.calls[0][0].initialState?.viewerId;
    cleanup();
    vi.mocked(ViewerProvider).mockClear();

    render(<CloverViewer iiifContent="https://example.org/manifest/b.json" />);
    const secondViewerId =
      vi.mocked(ViewerProvider).mock.calls[0][0].initialState?.viewerId;

    expect(firstViewerId).toBeTruthy();
    expect(secondViewerId).toBeTruthy();
    expect(firstViewerId).not.toEqual(secondViewerId);
  });
});
