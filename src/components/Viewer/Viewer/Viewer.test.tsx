import {
  ViewerProvider,
  defaultState,
  useViewerDispatch,
} from "src/context/viewer-context";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";

import React from "react";
import { Vault } from "@iiif/helpers/vault";
import Viewer from "src/components/Viewer/Viewer/Viewer";
import ViewerContent from "src/components/Viewer/Viewer/Content";
import { canvasWithPDFs } from "src/fixtures/viewer/custom-display/manifest-complex";

/*
 * Locally, not the shared `__mocks__` mock: that one exports no `Root`, which is the part
 * Viewer renders. Only the announcer is under test, so a passthrough is enough.
 */
vi.mock("@radix-ui/react-collapsible", () => ({
  Root: ({ children }: { children?: React.ReactNode }) => <>{children}</>,
}));

vi.mock("src/components/Viewer/Viewer/Content");
vi.mocked(ViewerContent).mockReturnValue(
  <div data-testid="mock-viewer-content">Content</div>,
);

vi.mock("src/components/Viewer/Viewer/Header", () => ({
  __esModule: true,
  default: () => <div data-testid="mock-viewer-header">Header</div>,
}));

vi.mock("src/components/Shared/Fullscreen/ExitFullscreen", () => ({
  __esModule: true,
  default: () => null,
}));

const canvasId = (n: number) =>
  `https://api.dc.library.northwestern.edu/api/v2/works/71153379-4283-43be-8b0f-4e7e3bfda275?as=iiif/canvas/access/${n}`;

/**
 * The canvas changes through a dispatch, not a prop: `ViewerProvider` seeds its reducer
 * from `initialState` once, so re-rendering with a different canvas would change nothing.
 */
const GoToCanvas: React.FC<{ canvasId: string }> = ({ canvasId }) => {
  const dispatch = useViewerDispatch();

  return (
    <button
      onClick={() => dispatch({ type: "updateActiveCanvas", canvasId })}
      data-testid="go-to-canvas"
    >
      go
    </button>
  );
};

const renderViewer = async (manifestFixture: unknown = canvasWithPDFs) => {
  const vault = new Vault();
  const manifest = await vault.loadManifest("", manifestFixture);

  const result = render(
    <ViewerProvider
      initialState={{ ...defaultState, vault, activeCanvas: canvasId(0) }}
    >
      {/* @ts-ignore the fixture is a plain manifest, not a normalized one */}
      <Viewer manifest={manifest} />
      <GoToCanvas canvasId={canvasId(1)} />
    </ViewerProvider>,
  );

  return { ...result, manifest };
};

describe("canvas announcer", () => {
  /*
   * Moving canvas swaps the image in place, which a screen reader has no reason to report,
   * so stepping through with the next control was silent (WCAG 4.1.3).
   */
  it("announces the canvas a reader moves to", async () => {
    await renderViewer();

    expect(screen.getByTestId("canvas-announcer")).toBeEmptyDOMElement();

    fireEvent.click(screen.getByTestId("go-to-canvas"));

    await waitFor(() =>
      expect(screen.getByTestId("canvas-announcer")).toHaveTextContent("Right"),
    );
  });

  /*
   * Plenty of manifests label no canvas at all, and an empty announcement tells the reader
   * nothing about a move they cannot see.
   */
  it("falls back to position when the canvas has no label", async () => {
    await renderViewer({
      ...canvasWithPDFs,
      items: canvasWithPDFs.items.map((item) => ({
        ...item,
        label: undefined,
      })),
    });

    fireEvent.click(screen.getByTestId("go-to-canvas"));

    await waitFor(() =>
      expect(screen.getByTestId("canvas-announcer")).toHaveTextContent(
        "Item 2 of 4",
      ),
    );
  });

  // The canvas the viewer opened on is not a change, and announcing it talks over the page.
  it("says nothing on first render", async () => {
    await renderViewer();

    expect(screen.getByTestId("canvas-announcer")).toBeEmptyDOMElement();
  });

  it("is a polite live region", async () => {
    await renderViewer();

    expect(screen.getByTestId("canvas-announcer")).toHaveAttribute(
      "aria-live",
      "polite",
    );
  });
});
