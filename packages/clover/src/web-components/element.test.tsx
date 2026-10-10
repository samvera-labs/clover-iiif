import {
  act,
  fireEvent,
  screen,
  waitFor,
  within,
} from "@testing-library/react";

import { defineCloverViewer } from "./element";
import bookJson from "../fixtures/iiif-cookbook/0009-book-1.json";
import { stubViewport } from "../components/Canvas/testing/viewport";
import { initCloverI18n } from "../i18n";

vi.mock("../lib/renderer", async (importOriginal) => ({
  ...(await importOriginal<typeof import("../lib/renderer")>()),
  CanvasRenderer: vi.fn().mockImplementation(() => ({
    host: document.createElement("div"),
    setImages: vi.fn().mockResolvedValue(undefined),
    setGestures: vi.fn(),
    dispose: vi.fn(),
    isOpen: false,
    backendKind: "webgl2",
    getBounds: () => ({ x: 0, y: 0, width: 100, height: 100 }),
    invalidate: vi.fn(),
    attachNavigator: vi.fn(() => vi.fn()),
    overlays: { container: document.createElement("div"), add: vi.fn() },
    on: () => () => undefined,
  })),
}));

let viewport: ReturnType<typeof stubViewport>;
beforeAll(() => defineCloverViewer({ styles: ".clover-root{}" }));
beforeEach(() => {
  initCloverI18n({ lng: "en" });
  viewport = stubViewport();
});
afterEach(() => {
  viewport.restore();
  document.body.innerHTML = "";
});

function mount(attributes: Record<string, string> = {}) {
  const element = document.createElement("clover-viewer") as HTMLElement & {
    iiifContent: unknown;
  };
  for (const [name, value] of Object.entries(attributes)) {
    element.setAttribute(name, value);
  }
  element.iiifContent = bookJson;
  act(() => {
    document.body.append(element);
  });
  return element;
}

describe("<clover-viewer>", () => {
  it("renders the Viewer in its light DOM, from a IIIF object set as a property", async () => {
    const element = mount();
    expect(
      await within(element).findByRole("heading", {
        name: "Simple Manifest - Book",
      }),
    ).toBeInTheDocument();
    expect(element.shadowRoot).toBeNull();
    // The stylesheet is in the document once, however many elements there are.
    mount();
    expect(
      document.querySelectorAll('style[data-clover="clover"]'),
    ).toHaveLength(1);
  });

  it("maps attributes to the Viewer's props, `false` turning a part off", async () => {
    const element = mount({ panel: "false", share: "false", items: "false" });
    await within(element).findByRole("heading", {
      name: "Simple Manifest - Book",
    });
    expect(within(element).queryByRole("tab", { name: "About" })).toBeNull();
    expect(within(element).queryByRole("button", { name: "Share" })).toBeNull();
    expect(within(element).queryByRole("listbox")).toBeNull();
  });

  it("tells the page where the reader moves, as events", async () => {
    const element = mount();
    const moved = vi.fn();
    element.addEventListener("canvaschange", (event) =>
      moved((event as CustomEvent).detail),
    );
    fireEvent.click(
      await within(element).findByRole("button", { name: "Next" }),
    );
    await waitFor(() =>
      expect(moved).toHaveBeenCalledWith({ canvasId: bookJson.items[1].id }),
    );
  });

  it("tears down when removed, and not when moved", async () => {
    const element = mount();
    await within(element).findByRole("heading", {
      name: "Simple Manifest - Book",
    });
    const other = document.createElement("div");
    document.body.append(other);
    await act(async () => {
      other.append(element); // a move: disconnected, then connected again at once
      await Promise.resolve();
    });
    expect(
      within(element).getByRole("heading", { name: "Simple Manifest - Book" }),
    ).toBeInTheDocument();
    await act(async () => {
      element.remove();
      await Promise.resolve();
    });
    expect(element.childNodes).toHaveLength(0);
    void screen;
  });
});
