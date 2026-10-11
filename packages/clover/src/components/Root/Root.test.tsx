import {
  act,
  fireEvent,
  render,
  screen,
  waitFor,
} from "@testing-library/react";
import React, { useState } from "react";

import bookJson from "../../fixtures/iiif-cookbook/0009-book-1.json";
import rtlJson from "../../fixtures/iiif-cookbook/0010-book-2-viewing-direction-rtl.json";
import { initCloverI18n } from "../../i18n";
import { useClover } from "../../react/context";
import { stubViewport } from "../Canvas/testing/viewport";
import * as Clover from "../../index";

const canvasIds = bookJson.items.map((canvas) => canvas.id);

/** A renderer stand-in that, unlike the real one, needs no WebGL: several listeners per event. */
const listeners = new Map<string, Set<(detail?: unknown) => void>>();
const emit = (event: string) =>
  act(() => listeners.get(event)?.forEach((listener) => listener()));
let renderer: Record<string, any>;

vi.mock("../../lib/renderer", async (importOriginal) => ({
  ...(await importOriginal<typeof import("../../lib/renderer")>()),
  CanvasRenderer: vi.fn().mockImplementation(() => renderer),
}));

let viewport: ReturnType<typeof stubViewport>;
beforeEach(() => {
  initCloverI18n({ lng: "en" });
  viewport = stubViewport();
  listeners.clear();
  renderer = {
    host: document.createElement("div"),
    setImages: vi.fn().mockResolvedValue(undefined),
    setGestures: vi.fn(),
    dispose: vi.fn(),
    isOpen: false,
    backendKind: "webgl2",
    getBounds: () => ({ x: 0, y: 0, width: 100, height: 100 }),
    fitBounds: vi.fn(),
    zoomBy: vi.fn(),
    rotateBy: vi.fn(),
    home: vi.fn(),
    invalidate: vi.fn(),
    attachNavigator: vi.fn(() => vi.fn()),
    itemRectToWorld: vi.fn(),
    overlays: { container: document.createElement("div"), add: vi.fn() },
    on: (event: string, listener: (detail?: unknown) => void) => {
      if (!listeners.has(event)) listeners.set(event, new Set());
      listeners.get(event)!.add(listener);
      return () => listeners.get(event)?.delete(listener);
    },
  };
});
afterEach(() => viewport.restore());

const shownCanvases = () =>
  (renderer.setImages.mock.calls.at(-1)?.[0] as Array<{ id: string }>).map(
    (image) => image.id.split("|")[0],
  );

describe("Clover.Root and its parts", () => {
  it("loads content and shares it: label, stage and pager", async () => {
    render(
      <Clover.Root iiifContent={bookJson}>
        <Clover.Label as="h1" />
        <Clover.Content />
        <Clover.Pager />
      </Clover.Root>,
    );
    expect(
      await screen.findByRole("heading", { name: "Simple Manifest - Book" }),
    ).toHaveAttribute("lang", "en");
    expect(screen.getByText(/Item 1 of/)).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Previous" })).toBeDisabled();
    await waitFor(() => expect(renderer.setImages).toHaveBeenCalled());
    expect(shownCanvases()).toEqual([canvasIds[0]]);
  });

  it("steps by view, a spread at a time, and announces where it went", async () => {
    render(
      <Clover.Root iiifContent={bookJson}>
        <Clover.Content />
        <Clover.Pager />
      </Clover.Root>,
    );
    fireEvent.click(await screen.findByRole("button", { name: "Next" }));
    expect(screen.getByText(/^Item 2 of/)).toHaveClass("clover-pager-position");
    await waitFor(() =>
      expect(shownCanvases()).toEqual([canvasIds[1], canvasIds[2]]),
    );
    expect(screen.getByRole("status")).toHaveTextContent(/Item 2 of/);
  });

  it("points the arrows the way a right-to-left book reads", async () => {
    render(
      <Clover.Root iiifContent={rtlJson}>
        <Clover.Pager />
      </Clover.Root>,
    );
    const next = await screen.findByRole("button", { name: "Next" });
    expect(next).toHaveAttribute("data-direction", "right-to-left");
    expect(next.querySelector("path")).toHaveAttribute(
      "transform",
      "rotate(180 8 8)",
    );
    // Next sits on the left, where the book continues.
    expect(screen.getByRole("navigation").firstElementChild).toBe(next);
  });

  it("follows a controlled canvasId, asking onCanvasChange to move", async () => {
    const onCanvasChange = vi.fn();
    function Host() {
      const [canvasId, setCanvasId] = useState(canvasIds[1]);
      return (
        <Clover.Root
          iiifContent={bookJson}
          canvasId={canvasId}
          onCanvasChange={(id) => {
            onCanvasChange(id);
            setCanvasId(id);
          }}
        >
          <Clover.Label of="canvas" data-testid="canvas-label" />
          <Clover.Pager />
        </Clover.Root>
      );
    }
    render(<Host />);
    expect(await screen.findByTestId("canvas-label")).toHaveTextContent(
      bookJson.items[1].label.en[0],
    );
    fireEvent.click(screen.getByRole("button", { name: "Next" }));
    expect(onCanvasChange).toHaveBeenLastCalledWith(canvasIds[3]);
    expect(screen.getByTestId("canvas-label")).toHaveTextContent(
      bookJson.items[3].label.en[0],
    );
  });

  it("frames a deep link's region once the Canvas is laid out, past its placeholder", async () => {
    const encoded = btoa(
      encodeURIComponent(
        JSON.stringify({
          type: "Annotation",
          motivation: ["contentState"],
          target: {
            type: "SpecificResource",
            source: { id: canvasIds[0], type: "Canvas" },
            selector: { type: "FragmentSelector", value: "xywh=10,20,30,40" },
          },
        }),
      ),
    );
    // A content state naming a Canvas with no `partOf` loads that Canvas.
    const fetch = vi.fn(
      async () =>
        new Response(
          JSON.stringify({
            "@context": "http://iiif.io/api/presentation/3/context.json",
            ...bookJson.items[0],
          }),
        ),
    );
    render(
      <Clover.Root iiifContent={encoded} request={{ fetch }}>
        <Clover.Content />
      </Clover.Root>,
    );
    await waitFor(() => expect(renderer.setImages).toHaveBeenCalled());
    expect(renderer.fitBounds).not.toHaveBeenCalled();
    emit("open");
    expect(renderer.fitBounds).toHaveBeenCalledTimes(1);
    const [world] = renderer.fitBounds.mock.calls[0];
    expect(world).toEqual({ x: 10, y: 20, width: 30, height: 40 });
    // Consumed: a later layout does not frame it again.
    emit("change");
    expect(renderer.fitBounds).toHaveBeenCalledTimes(1);
  });

  it("sends viewport updates through a channel, writing nothing to the store", async () => {
    let clover: ReturnType<typeof useClover>["clover"] | null = null;
    function Spy() {
      clover = useClover().clover;
      return null;
    }
    render(
      <Clover.Root iiifContent={bookJson}>
        <Spy />
        <Clover.Content />
      </Clover.Root>,
    );
    await waitFor(() => expect(renderer.setImages).toHaveBeenCalled());
    emit("open");
    const writes = vi.fn();
    const heard = vi.fn();
    clover!.store.subscribe(writes);
    clover!.viewport.subscribe(heard);
    for (let frame = 0; frame < 60; frame++) emit("viewport");
    expect(heard).toHaveBeenCalledTimes(60);
    expect(heard.mock.lastCall?.[0]).toMatchObject({ canvasId: canvasIds[0] });
    expect(writes).not.toHaveBeenCalled();
  });

  it("shows loading and error states", async () => {
    const fetch = vi.fn(async () => new Response("nope", { status: 500 }));
    render(
      <Clover.Root iiifContent="https://example.org/broken" request={{ fetch }}>
        <Clover.Status />
      </Clover.Root>,
    );
    expect(screen.getByText("Loading…")).toHaveAttribute("role", "status");
    expect(await screen.findByRole("alert")).toHaveTextContent(
      "This could not be loaded.",
    );
  });

  it("assembles the ready-made Viewer from the same parts", async () => {
    render(<Clover.Viewer iiifContent={bookJson} />);
    expect(
      await screen.findByRole("heading", { name: "Simple Manifest - Book" }),
    ).toBeInTheDocument();
    expect(screen.getByRole("listbox", { name: "Items" })).toBeInTheDocument();
  });

  it("names the part used outside a Root", () => {
    vi.spyOn(console, "error").mockImplementation(() => undefined);
    expect(() => render(<Clover.Pager />)).toThrow(/<Clover.Root>/);
  });
});
