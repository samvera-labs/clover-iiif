import {
  act,
  fireEvent,
  render,
  screen,
  waitFor,
  within,
} from "@testing-library/react";
import React from "react";

import imageJson from "../../fixtures/iiif-cookbook/0377-image-in-annotation.json";
import { initCloverI18n } from "../../i18n";
import * as Clover from "../../index";
import { stubViewport } from "../Canvas/testing/viewport";
import { resolveContentState } from "../../core/content-state";

/** A renderer stand-in: several listeners per event, and the overlay layer hotspots use. */
const listeners = new Map<string, Set<(detail?: unknown) => void>>();
const emit = (event: string) =>
  act(() => listeners.get(event)?.forEach((listener) => listener()));
let renderer: Record<string, any>;

vi.mock("../../lib/renderer", async (importOriginal) => ({
  ...(await importOriginal<typeof import("../../lib/renderer")>()),
  CanvasRenderer: vi.fn().mockImplementation(() => renderer),
}));

const canvasId = imageJson.items[0].id;
const annotationId = imageJson.items[0].annotations[0].items[0].id;

let viewport: ReturnType<typeof stubViewport>;
beforeEach(() => {
  initCloverI18n({ lng: "en" });
  viewport = stubViewport();
  listeners.clear();
  const overlays = document.createElement("div");
  document.body.appendChild(overlays);
  renderer = {
    host: document.createElement("div"),
    setImages: vi.fn().mockResolvedValue(undefined),
    setGestures: vi.fn(),
    dispose: vi.fn(),
    isOpen: false,
    backendKind: "webgl2",
    getBounds: () => ({ x: 0, y: 0, width: 4032, height: 3024 }),
    fitBounds: vi.fn(),
    fitAnnotation: vi.fn(),
    home: vi.fn(),
    invalidate: vi.fn(),
    attachNavigator: vi.fn(() => vi.fn()),
    itemRectToWorld: vi.fn(),
    overlays: { container: overlays, add: vi.fn(() => vi.fn()) },
    on: (event: string, listener: (detail?: unknown) => void) => {
      if (!listeners.has(event)) listeners.set(event, new Set());
      listeners.get(event)!.add(listener);
      return () => listeners.get(event)?.delete(listener);
    },
  };
});
afterEach(() => viewport.restore());

async function renderWithStage(
  children: React.ReactNode = <Clover.Annotations />,
) {
  render(
    <Clover.Root iiifContent={imageJson}>
      <Clover.Content />
      {children}
    </Clover.Root>,
  );
  await waitFor(() => expect(renderer.setImages).toHaveBeenCalled());
  emit("open");
}

describe("Annotations", () => {
  it("lists the view's annotations by set, image and text bodies alike", async () => {
    await renderWithStage();
    const list = screen.getByRole("list");
    const [entry] = within(list).getAllByRole("listitem");
    expect(entry.querySelector("img")).toHaveAttribute(
      "src",
      expect.stringMatching(/fountain/),
    );
    expect(entry).toHaveTextContent("Gänseliesel fountain");
    expect(
      within(entry).getByRole("button", {
        name: /^Find on the image: Night picture/,
      }),
    ).toHaveAttribute("aria-pressed", "false");
  });

  it("frames a picked annotation on the Canvas, and marks it picked", async () => {
    await renderWithStage();
    fireEvent.click(screen.getByRole("button", { name: /Find on the image/ }));
    expect(renderer.fitAnnotation).toHaveBeenCalledWith({
      x: 138,
      y: 550,
      width: 1477,
      height: 1710,
    });
    expect(
      screen.getByRole("button", { name: /Find on the image/ }),
    ).toHaveAttribute("aria-pressed", "true");
    // Its hotspot is the active one.
    expect(document.getElementById(annotationId)).toHaveAttribute(
      "data-active",
      "true",
    );
  });

  it("shares one highlight between the list and the hotspots, with no timers", async () => {
    await renderWithStage();
    const entry = screen.getByRole("listitem");
    fireEvent.mouseEnter(entry);
    expect(document.getElementById(annotationId)).toHaveAttribute(
      "data-active",
      "true",
    );
    fireEvent.mouseLeave(entry);
    expect(document.getElementById(annotationId)).toHaveAttribute(
      "data-active",
      "false",
    );
    fireEvent.mouseOver(document.getElementById(annotationId)!);
    expect(entry).toHaveAttribute("data-highlighted", "true");
  });

  it("hides a set's annotations from the Canvas with its checkbox", async () => {
    await renderWithStage();
    expect(document.getElementById(annotationId)).not.toBeNull();
    const hide = screen.getByRole("checkbox", { name: "Hide Annotations" });
    expect(hide).not.toBeChecked();
    // Its AnnotationPage has no label, so the set has no heading of its own.
    expect(screen.queryByRole("heading")).toBeNull();
    fireEvent.click(hide);
    expect(hide).toBeChecked();
    expect(document.getElementById(annotationId)).toBeNull();
    // The list keeps it, to switch back.
    expect(screen.getByRole("listitem")).toBeInTheDocument();
  });

  it("joins the information panel as a tab when there are annotations", async () => {
    render(
      <Clover.Root iiifContent={imageJson}>
        <Clover.InformationPanel />
      </Clover.Root>,
    );
    expect(
      await screen.findByRole("tab", { name: "Annotations" }),
    ).toBeInTheDocument();
  });

  it("shows annotations a host adds", async () => {
    const page = {
      "@context": "http://iiif.io/api/presentation/3/context.json",
      id: "https://example.org/added",
      type: "AnnotationPage",
      label: { en: ["Added notes"] },
      items: [
        {
          id: "https://example.org/added/1",
          type: "Annotation",
          motivation: "commenting",
          body: { type: "TextualBody", value: "A note of mine" },
          target: `${canvasId}#xywh=0,0,10,10`,
        },
      ],
    };
    render(
      <Clover.Root iiifContent={imageJson} annotations={page}>
        <Clover.Annotations />
      </Clover.Root>,
    );
    expect(
      await screen.findByRole("heading", { name: "Added notes" }),
    ).toBeInTheDocument();
    expect(screen.getByText("A note of mine")).toBeInTheDocument();
  });
});

describe("content state", () => {
  it("reports where the reader is once it settles", async () => {
    vi.useFakeTimers({ shouldAdvanceTime: true });
    const onContentStateChange = vi.fn();
    render(
      <Clover.Root
        iiifContent={imageJson}
        onContentStateChange={onContentStateChange}
      >
        <Clover.Content />
      </Clover.Root>,
    );
    await waitFor(() => expect(renderer.setImages).toHaveBeenCalled());
    emit("open");
    for (let frame = 0; frame < 10; frame++) emit("viewport");
    await act(() => vi.advanceTimersByTimeAsync(400));
    expect(onContentStateChange).toHaveBeenCalledTimes(1);
    const [{ json }] = onContentStateChange.mock.lastCall!;
    expect(resolveContentState(json)?.target).toMatchObject({ canvasId });
    vi.useRealTimers();
  });
});
