import { act, fireEvent, render, screen } from "@testing-library/react";
import React from "react";

import Canvas from "src/components/Canvas";
import book from "src/fixtures/iiif-cookbook/0009-book-1.json";
import rtl from "src/fixtures/iiif-cookbook/0010-book-2-viewing-direction-rtl.json";
import metadataAnywhere from "src/fixtures/iiif-cookbook/0029-metadata-anywhere.json";
import choice from "src/fixtures/iiif-cookbook/0033-choice.json";
import { initCloverI18n } from "src/i18n";
import { CanvasRenderer } from "src/lib/renderer";
import { stubViewport } from "src/components/Canvas/testing/viewport";

const listeners: Record<string, (detail?: unknown) => void> = {};
let renderer: Record<string, any>;

vi.mock("src/lib/renderer", async (importOriginal) => ({
  ...(await importOriginal<typeof import("src/lib/renderer")>()),
  CanvasRenderer: vi.fn().mockImplementation(() => renderer),
}));

// Each Canvas is on screen, so it loads; see the lazy-loading test for one that is not.
let viewport: ReturnType<typeof stubViewport>;
beforeEach(() => {
  viewport = stubViewport();
});
afterEach(() => viewport.restore());

beforeEach(() => {
  vi.clearAllMocks();
  const overlays = document.createElement("div");
  renderer = {
    setImages: vi.fn().mockResolvedValue(undefined),
    dispose: vi.fn(),
    isOpen: false,
    backendKind: "webgl2",
    getBounds: () => ({ x: 1, y: 2, width: 3, height: 4 }),
    zoomBy: vi.fn(),
    rotateBy: vi.fn(),
    home: vi.fn(),
    invalidate: vi.fn(),
    fitItemRect: vi.fn(),
    fitAnnotation: vi.fn(),
    attachNavigator: vi.fn(() => vi.fn()),
    itemRectToWorld: vi.fn((_: number, rect: any) => rect),
    overlays: { container: overlays, add: vi.fn(() => vi.fn()) },
    on: (event: string, listener: (detail?: unknown) => void) => {
      listeners[event] = listener;
      return () => delete listeners[event];
    },
  };
  document.body.appendChild(overlays);
});

const open = () => act(() => listeners.open());

describe("Canvas", () => {
  it("renders nothing without a source, as Image does", () => {
    const { container } = render(<Canvas src={[]} />);
    expect(container).toBeEmptyDOMElement();
  });

  it("renders an accessible, focusable viewport", () => {
    render(<Canvas src="https://example.org/a.jpg" label="A letter" />);
    const viewport = screen.getByRole("img", { name: "A letter" });
    expect(viewport).toHaveAttribute("tabindex", "0");
    expect(screen.getByTestId("clover-canvas")).toHaveAttribute(
      "data-status",
      "loading",
    );
  });

  it("tiles a body from its image service, keeping body.id as the fallback", () => {
    render(
      <Canvas
        body={{
          id: "https://example.org/iiif/abc/full/max/0/default.jpg",
          type: "Image",
          width: 8949,
          height: 5709,
          region: "100,200,300,400",
          service: [
            { "@id": "https://example.org/iiif/abc", "@type": "ImageService2" },
          ] as any,
        }}
      />,
    );
    expect(renderer.setImages).toHaveBeenCalledWith(
      [
        {
          id: "0:https://example.org/iiif/abc/full/max/0/default.jpg|100,200,300,400",
          service: "https://example.org/iiif/abc",
          url: "https://example.org/iiif/abc/full/max/0/default.jpg",
          width: 8949,
          height: 5709,
          region: "100,200,300,400",
        },
      ],
      expect.anything(),
    );
  });

  it("treats src as an image service with isTiledImage", () => {
    render(
      <Canvas src="https://example.org/iiif/abc/info.json" isTiledImage />,
    );
    expect(renderer.setImages).toHaveBeenCalledWith(
      [
        {
          id: "0:https://example.org/iiif/abc/info.json",
          service: "https://example.org/iiif/abc/info.json",
        },
      ],
      expect.anything(),
    );
  });

  it("does not reload when the parent re-renders with equal sources", () => {
    const { rerender } = render(<Canvas src={["a.jpg", "b.jpg"]} />);
    rerender(<Canvas src={["a.jpg", "b.jpg"]} />);
    expect(renderer.setImages).toHaveBeenCalledTimes(1);
    expect(CanvasRenderer).toHaveBeenCalledTimes(1);
  });

  it("hands over a handle when the renderer opens, and reports the viewport", () => {
    const onReady = vi.fn();
    const onViewportChange = vi.fn();
    render(
      <Canvas
        src="a.jpg"
        onReady={onReady}
        onViewportChange={onViewportChange}
      />,
    );
    act(() => {
      listeners.open();
      listeners.viewport();
    });
    expect(screen.getByTestId("clover-canvas")).toHaveAttribute(
      "data-status",
      "ready",
    );
    expect(onReady).toHaveBeenCalledWith(renderer);
    expect(onViewportChange).toHaveBeenCalledWith({
      x: 1,
      y: 2,
      width: 3,
      height: 4,
    });
  });

  describe("controls", () => {
    it("renders Image's cluster, with the same data-button hooks", () => {
      render(<Canvas src="a.jpg" instanceId="x" />);
      const buttons = screen
        .getByTestId("clover-iiif-image-openseadragon-controls")
        .querySelectorAll("button");
      expect([...buttons].map((b) => b.dataset.button)).toEqual([
        "zoom-in",
        "zoom-out",
        "full-page",
        "rotate-right",
        "rotate-left",
        "reset",
      ]);
      expect(buttons[0]).toHaveAttribute("id", "zoomIn-x");
    });

    it("drives the renderer by click rather than OpenSeadragon's id binding", () => {
      render(<Canvas src="a.jpg" />);
      fireEvent.click(screen.getByRole("button", { name: "Zoom in" }));
      fireEvent.click(screen.getByRole("button", { name: "Zoom out" }));
      fireEvent.click(screen.getByRole("button", { name: "Rotate right" }));
      fireEvent.click(screen.getByRole("button", { name: "Rotate left" }));
      fireEvent.click(screen.getByRole("button", { name: "Reset zoom" }));
      expect(renderer.zoomBy).toHaveBeenNthCalledWith(1, 2);
      expect(renderer.zoomBy).toHaveBeenNthCalledWith(2, 0.5);
      expect(renderer.rotateBy).toHaveBeenNthCalledWith(1, 90);
      expect(renderer.rotateBy).toHaveBeenNthCalledWith(2, -90);
      expect(renderer.home).toHaveBeenCalled();
    });

    it("shows a subset of controls, or none", () => {
      const { rerender } = render(
        <Canvas src="a.jpg" controls={{ rotation: false }} />,
      );
      expect(
        screen.getByRole("button", { name: "Zoom in" }),
      ).toBeInTheDocument();
      expect(screen.queryByRole("button", { name: "Rotate right" })).toBeNull();

      rerender(<Canvas src="a.jpg" controls={false} />);
      expect(
        screen.queryByTestId("clover-iiif-image-openseadragon-controls"),
      ).toBeNull();
    });

    it("labels them in Clover's language, as Image does", () => {
      initCloverI18n({ lng: "fr" });
      render(<Canvas src="a.jpg" />);
      expect(
        screen.getByRole("button", { name: "Zoom avant" }),
      ).toBeInTheDocument();
      initCloverI18n({ lng: "en" });
    });

    it("honours controlButtons replacements", () => {
      const ZoomIn = ({ buttonProps, label }: any) => (
        <button {...buttonProps} data-custom>
          {label}!
        </button>
      );
      render(<Canvas src="a.jpg" controlButtons={{ zoomIn: ZoomIn }} />);
      const custom = screen.getByRole("button", { name: "Zoom in" });
      expect(custom).toHaveAttribute("data-custom");
      fireEvent.click(custom);
      expect(renderer.zoomBy).toHaveBeenCalledWith(2);
    });
  });

  describe("navigator", () => {
    it("is off by default", () => {
      render(<Canvas src="a.jpg" />);
      expect(screen.queryByTestId("clover-canvas-navigator")).toBeNull();
      expect(renderer.attachNavigator).not.toHaveBeenCalled();
    });

    it("attaches an overview when turned on", () => {
      render(<Canvas src="a.jpg" navigator />);
      const navigator = screen.getByTestId("clover-canvas-navigator");
      expect(renderer.attachNavigator).toHaveBeenCalledWith(navigator);
    });
  });

  describe("annotations", () => {
    const annotations = [
      {
        targetIndex: 0,
        annotation: {
          id: "https://example.org/anno/1",
          type: "Annotation",
          body: [
            { type: "TextualBody", value: "<b>Fountain</b> &amp; square" },
          ],
          target: "https://example.org/canvas#xywh=10,20,30,40",
        } as any,
      },
      {
        targetIndex: 0,
        annotation: {
          id: "https://example.org/anno/point",
          type: "Annotation",
          target: {
            source: "https://example.org/canvas",
            selector: { type: "PointSelector", x: 1, y: 2 },
          },
        } as any,
      },
    ];

    it("pins a named button to each rectangular target, once laid out", () => {
      render(<Canvas src="a.jpg" annotations={annotations} label="Photo" />);
      expect(screen.queryByRole("button", { name: /Fountain/ })).toBeNull();
      open();

      // Hotspots must stay reachable: an `img` role would hide them.
      expect(screen.getByRole("group", { name: "Photo" })).toBeInTheDocument();
      // HTML bodies are read as text, never injected.
      const button = screen.getByRole("button", { name: "Fountain & square" });
      expect(button.querySelector("b")).toBeNull();
      expect(button.parentElement).toBe(renderer.overlays.container);
      expect(renderer.overlays.add).toHaveBeenCalledWith(button, {
        x: 10,
        y: 20,
        width: 30,
        height: 40,
      });
      // Only rect targets get a hotspot.
      expect(renderer.overlays.add).toHaveBeenCalledTimes(1);
    });

    it("marks the hovered or focused hotspot active and reports it", () => {
      const onAnnotationActive = vi.fn();
      render(
        <Canvas
          src="a.jpg"
          annotations={annotations}
          onAnnotationActive={onAnnotationActive}
        />,
      );
      open();
      const button = screen.getByRole("button", { name: "Fountain & square" });
      fireEvent.mouseOver(button);
      expect(button).toHaveAttribute("data-active", "true");
      expect(onAnnotationActive).toHaveBeenLastCalledWith(
        "https://example.org/anno/1",
      );
      fireEvent.mouseOut(button);
      expect(button).toHaveAttribute("data-active", "false");
      expect(onAnnotationActive).toHaveBeenLastCalledWith(null);
      fireEvent.focus(button);
      expect(button).toHaveAttribute("data-active", "true");
    });

    it("lists them in a menu from a comment control; picking one zooms to it", () => {
      render(<Canvas src="a.jpg" annotations={annotations} />);
      open();
      const control = screen.getByRole("button", { name: "Annotations" });
      expect(control).toHaveAttribute("data-button", "annotations");
      expect(control).toHaveAttribute("aria-expanded", "false");

      fireEvent.click(control);
      expect(control).toHaveAttribute("aria-expanded", "true");
      // Only the drawable (rectangular) annotation is listed, by its text.
      const items = screen.getAllByRole("radio");
      expect(items).toHaveLength(1);
      const item = screen.getByRole("radio", { name: "Fountain & square" });
      expect(item).not.toBeChecked();

      fireEvent.click(item);
      expect(item).toBeChecked();
      expect(renderer.fitAnnotation).toHaveBeenCalledWith({
        x: 10,
        y: 20,
        width: 30,
        height: 40,
      });
      // Its hotspot stays highlighted as the current one.
      expect(
        screen.getByRole("button", { name: "Fountain & square" }),
      ).toHaveAttribute("data-active", "true");

      fireEvent.keyDown(document, { key: "Escape" });
      expect(control).toHaveAttribute("aria-expanded", "false");
      expect(control).toHaveFocus();
    });

    it("offers no annotations control without drawable annotations, or when turned off", () => {
      const { unmount } = render(<Canvas src="a.jpg" />);
      open();
      expect(screen.queryByRole("button", { name: "Annotations" })).toBeNull();
      unmount();

      render(
        <Canvas
          src="a.jpg"
          annotations={annotations}
          controls={{ annotations: false }}
        />,
      );
      open();
      expect(screen.queryByRole("button", { name: "Annotations" })).toBeNull();
    });

    it("zooms to its target on click", () => {
      render(<Canvas src="a.jpg" annotations={annotations} />);
      open();
      fireEvent.click(
        screen.getByRole("button", { name: "Fountain & square" }),
      );
      expect(renderer.fitAnnotation).toHaveBeenCalledWith({
        x: 10,
        y: 20,
        width: 30,
        height: 40,
      });
    });
  });

  it("disposes the renderer on unmount", () => {
    const { unmount } = render(<Canvas src="a.jpg" />);
    unmount();
    expect(renderer.dispose).toHaveBeenCalled();
  });

  describe("IIIF Canvases", () => {
    const lastScene = () => renderer.setImages.mock.lastCall;
    const pages = book.items as any[];

    it("composes a Canvas's painted images, with the Canvas as the world", () => {
      render(<Canvas canvases={[pages[0]]} />);
      const [images, { world }] = lastScene();
      expect(images).toHaveLength(1);
      expect(world).toEqual({ x: 0, y: 0, width: 3204, height: 4613 });
    });

    it("draws the Canvases a host hands over together, in reading order", () => {
      render(
        <Canvas
          canvases={pages.slice(1, 3)}
          viewingDirection="right-to-left"
        />,
      );
      const [images] = lastScene();
      // Right to left: the first page sits to the right of the second.
      expect(images[0].placement.x).toBeGreaterThan(images[1].placement.x);
    });

    it("frames afresh when the host hands over different Canvases", () => {
      const { rerender } = render(<Canvas canvases={[pages[0]]} />);
      expect(lastScene()[1].fit).toBe(false);
      rerender(<Canvas canvases={pages.slice(1, 3)} />);
      expect(lastScene()[1].fit).toBe(true);
    });

    it("has no previous/next of its own: stepping is the host's job", () => {
      render(<Canvas canvases={pages.slice(1, 3)} />);
      expect(screen.queryByRole("button", { name: "Next" })).toBeNull();
      expect(screen.queryByRole("button", { name: "Previous" })).toBeNull();
    });

    it("places an annotation on the Canvas its target names", () => {
      const spread = rtl.items.slice(1, 3) as any[];
      render(
        <Canvas
          canvases={spread}
          viewingDirection="right-to-left"
          annotations={[
            {
              targetIndex: 0,
              annotation: {
                id: "https://example.org/anno/a",
                type: "Annotation",
                body: [{ type: "TextualBody", value: "On the second page" }],
                target: `${spread[1].id}#xywh=0,0,100,100`,
              } as any,
            },
          ]}
        />,
      );
      act(() => listeners.open());
      // The second Canvas is on the left in right-to-left order, so x stays at 0.
      expect(renderer.overlays.add).toHaveBeenCalledWith(
        expect.any(HTMLElement),
        expect.objectContaining({ x: 0, y: 0 }),
      );
    });
  });
  describe("Choice", () => {
    const xrayCanvas = choice.items as any[];

    it("offers a choice control only when the Canvas has a Choice", () => {
      const { rerender } = render(
        <Canvas canvases={book.items.slice(0, 1) as any} />,
      );
      expect(screen.queryByRole("button", { name: "Choice" })).toBeNull();
      rerender(<Canvas canvases={xrayCanvas} />);
      const control = screen.getByRole("button", { name: "Choice" });
      expect(control).toHaveAttribute("data-button", "choice");
      expect(control).toHaveAttribute("aria-expanded", "false");
    });

    it("lists the items, first selected, and paints the one picked", () => {
      render(<Canvas canvases={xrayCanvas} />);
      expect(renderer.setImages.mock.lastCall[0][0].url).toMatch(/natural/i);

      fireEvent.click(screen.getByRole("button", { name: "Choice" }));
      expect(screen.getByRole("button", { name: "Choice" })).toHaveAttribute(
        "aria-expanded",
        "true",
      );
      expect(
        screen.getByRole("radio", { name: "Natural Light" }),
      ).toBeChecked();

      fireEvent.click(screen.getByRole("radio", { name: "X-Ray" }));
      const [images, { fit }] = renderer.setImages.mock.lastCall;
      expect(images[0].url).toMatch(/xray/i);
      // Same Canvas: the reader's view is kept.
      expect(fit).toBe(false);
    });

    it("closes on Escape, returning focus to the control", () => {
      render(<Canvas canvases={xrayCanvas} />);
      const control = screen.getByRole("button", { name: "Choice" });
      fireEvent.click(control);
      fireEvent.keyDown(document, { key: "Escape" });
      expect(screen.queryByTestId("clover-canvas-choice")).toBeNull();
      expect(control).toHaveFocus();
    });
  });

  describe("information", () => {
    const [natural, xray] = metadataAnywhere.items as any[];
    const about = () => screen.getByRole("button", { name: "About" });
    const caption = () => screen.getByTestId("clover-canvas-caption");

    it("offers an information control only when a Canvas has a summary or metadata", () => {
      const { rerender } = render(
        <Canvas canvases={book.items.slice(0, 1) as any} />,
      );
      expect(screen.queryByRole("button", { name: "About" })).toBeNull();
      expect(screen.queryByTestId("clover-canvas-caption")).toBeNull();

      rerender(<Canvas canvases={[natural]} />);
      expect(about()).toHaveAttribute("data-button", "information");
      expect(about()).toHaveAttribute("aria-expanded", "false");
      expect(about()).toHaveAttribute("aria-controls", caption().id);
      expect(caption().tagName).toBe("FIGCAPTION");
      expect(caption()).toHaveAttribute("data-open", "false");

      rerender(
        <Canvas
          canvases={[
            { ...natural, metadata: undefined, summary: { en: ["A note"] } },
          ]}
        />,
      );
      expect(about()).toBeInTheDocument();
    });

    it("is hidden when turned off", () => {
      render(<Canvas canvases={[natural]} controls={{ information: false }} />);
      expect(screen.queryByRole("button", { name: "About" })).toBeNull();
      expect(screen.queryByTestId("clover-canvas-caption")).toBeNull();
    });

    it("slides out the Canvas's label and metadata, naming the figure", async () => {
      render(<Canvas canvases={[natural]} />);
      expect(
        screen.getByRole("figure", { name: "Painting under natural light" }),
      ).toBe(screen.getByTestId("clover-canvas"));

      fireEvent.click(about());
      expect(about()).toHaveAttribute("aria-expanded", "true");
      expect(caption()).toHaveAttribute("data-open", "true");
      expect(caption()).toHaveFocus();
      expect(await screen.findByText("Description")).toBeInTheDocument();
      expect(screen.getByText(/house at Mortlake/)).toBeInTheDocument();

      fireEvent.click(about());
      expect(caption()).toHaveAttribute("data-open", "false");
    });

    it("captions each Canvas of a spread", async () => {
      render(<Canvas canvases={[natural, xray]} />);
      fireEvent.click(about());
      expect(
        screen.getByText("Painting under natural light"),
      ).toBeInTheDocument();
      expect(screen.getByText("X-ray view of painting")).toBeInTheDocument();
      expect(await screen.findAllByText("Description")).toHaveLength(2);
    });

    it("closes from its close button or Escape, returning focus to the control", () => {
      render(<Canvas canvases={[natural]} />);
      fireEvent.click(about());
      fireEvent.click(screen.getByRole("button", { name: "Close" }));
      expect(caption()).toHaveAttribute("data-open", "false");
      expect(about()).toHaveFocus();

      fireEvent.click(about());
      fireEvent.keyDown(caption(), { key: "Escape" });
      expect(caption()).toHaveAttribute("data-open", "false");
      expect(about()).toHaveFocus();
    });
  });

  describe("chrome", () => {
    afterEach(() => vi.useRealTimers());

    it("shows on pointer activity and fades after the hide delay", () => {
      vi.useFakeTimers();
      render(<Canvas src="a.jpg" options={{ hideDelay: 500 }} />);
      const canvas = screen.getByTestId("clover-canvas");
      expect(canvas).toHaveAttribute("data-chrome", "hidden");

      fireEvent.pointerMove(canvas);
      expect(canvas).toHaveAttribute("data-chrome", "visible");
      act(() => {
        vi.advanceTimersByTime(600);
      });
      expect(canvas).toHaveAttribute("data-chrome", "hidden");
    });

    it("hides a second after a mouse leaves", () => {
      vi.useFakeTimers();
      render(<Canvas src="a.jpg" />);
      const canvas = screen.getByTestId("clover-canvas");
      fireEvent.pointerMove(canvas);
      fireEvent.pointerLeave(canvas, { pointerType: "mouse" });
      expect(canvas).toHaveAttribute("data-chrome", "visible");
      act(() => void vi.advanceTimersByTime(1000));
      expect(canvas).toHaveAttribute("data-chrome", "hidden");
      vi.useRealTimers();
    });
  });
});
