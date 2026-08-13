import { fireEvent, render, screen } from "@testing-library/react";

import InformationPanel from "src/components/Viewer/InformationPanel/InformationPanel";
import React from "react";
import { Vault } from "@iiif/helpers/vault";

const mockDispatch = vi.fn();

vi.mock("src/components/Viewer/InformationPanel/About/About", () => ({
  __esModule: true,
  default: () => <div data-testid="mock-about">About</div>,
}));

// maplibre-gl uses browser APIs unavailable in jsdom; see __mocks__/maplibre-gl.ts
vi.mock("maplibre-gl");

vi.mock("@allmaps/maplibre", () => ({
  WarpedMapLayer: vi.fn(() => ({
    addGeoreferenceAnnotation: vi.fn().mockResolvedValue([]),
    setOpacity: vi.fn(),
  })),
}));

/**
 * Identities must be stable across renders. `vault` and `visibleCanvases` are
 * effect dependencies in InformationPanel, so returning fresh values on every
 * render re-triggers those effects and spins the component in a render loop.
 */
const createMockState = (overrides = {}) => ({
  activeManifest: "https://example.org/manifest",
  collection: {},
  informationPanelResource: "manifest-about",
  isAutoScrolling: false,
  isUserScrolling: false,
  sequence: [[], []],
  vault: new Vault(),
  visibleCanvases: [],
  configOptions: {
    informationPanel: {
      renderAbout: true,
      renderAnnotation: true,
      renderContentSearch: true,
      renderContents: true,
      renderToggle: true,
    },
  },
  plugins: [],
  ...overrides,
});

let mockState = createMockState();

vi.mock("src/context/viewer-context", () => ({
  useViewerDispatch: () => mockDispatch,
  useViewerState: () => mockState,
}));

const props = {
  activeCanvas: "foobar",
  resources: [],
  setContentSearchResource: () => {},
};

const createVaultWithStructures = () => {
  const vault = new Vault();
  const manifest = vault.loadSync("https://example.org/manifest", {
    id: "https://example.org/manifest",
    type: "Manifest",
    label: { none: ["Book"] },
    items: [
      {
        id: "https://example.org/canvas/1",
        type: "Canvas",
        label: { none: ["Page 1"] },
        height: 100,
        width: 100,
        items: [],
      },
      {
        id: "https://example.org/canvas/2",
        type: "Canvas",
        label: { none: ["Page 2"] },
        height: 100,
        width: 100,
        items: [],
      },
    ],
    structures: [
      {
        id: "https://example.org/range/toc",
        type: "Range",
        label: { none: ["Table of Contents"] },
        items: [
          {
            id: "https://example.org/range/chapter-1",
            type: "Range",
            label: { none: ["Chapter 1"] },
            items: [{ id: "https://example.org/canvas/1", type: "Canvas" }],
          },
          {
            id: "https://example.org/range/chapter-2",
            type: "Range",
            label: { none: ["Chapter 2"] },
            items: [{ id: "https://example.org/canvas/2", type: "Canvas" }],
          },
        ],
      },
    ],
  }) as { id: string };

  return { manifest, vault };
};

const newspaperCanvasIds = [
  "https://example.org/newspaper/canvas/p1",
  "https://example.org/newspaper/canvas/p2",
  "https://example.org/newspaper/canvas/p3",
  "https://example.org/newspaper/canvas/p4",
  "https://example.org/newspaper/canvas/p5",
];

const createVaultWithNewspaperStructures = () => {
  const vault = new Vault();
  const manifest = vault.loadSync("https://example.org/newspaper/manifest", {
    id: "https://example.org/newspaper/manifest",
    type: "Manifest",
    label: { de: ["Bozner Zeitung"] },
    items: newspaperCanvasIds.map((id, index) => ({
      id,
      type: "Canvas",
      label: { de: [`Seite ${index + 1}.`] },
      height: 100,
      width: 100,
      items: [],
    })),
    structures: [
      {
        id: "https://example.org/newspaper/range/articles",
        type: "Range",
        label: { none: ["Articles"] },
        items: [
          {
            id: "https://example.org/newspaper/range/tagesneuigkeiten",
            type: "Range",
            label: { de: ["Tagesneuigkeiten"] },
            items: [
              {
                type: "SpecificResource",
                source: { id: newspaperCanvasIds[1], type: "Canvas" },
                selector: {
                  type: "FragmentSelector",
                  value: "xywh=553,1157,470,1103",
                },
              },
              {
                type: "SpecificResource",
                source: { id: newspaperCanvasIds[4], type: "Canvas" },
                selector: {
                  type: "FragmentSelector",
                  value: "xywh=569,104,478,2153",
                },
              },
            ],
          },
          {
            id: "https://example.org/newspaper/range/das-turnier",
            type: "Range",
            label: { de: ["Das Turnier"] },
            items: [
              {
                type: "SpecificResource",
                source: { id: newspaperCanvasIds[2], type: "Canvas" },
                selector: {
                  type: "FragmentSelector",
                  value: "xywh=113,1489,488,808",
                },
              },
            ],
          },
        ],
      },
    ],
  }) as { id: string };

  return { manifest, vault };
};

const sequenceWithTwoCanvases = [
  [
    { id: "https://example.org/canvas/1", type: "Canvas" },
    { id: "https://example.org/canvas/2", type: "Canvas" },
  ],
  [[0], [1]],
];

const sequenceWithFiveCanvases = [
  newspaperCanvasIds.map((id) => ({ id, type: "Canvas" })),
  newspaperCanvasIds.map((_, index) => [index]),
];

describe("InformationPanel", () => {
  beforeEach(() => {
    mockDispatch.mockClear();
    mockState = createMockState();
  });

  test("renders an element with the 'clover-viewer-information-panel' class name", () => {
    render(<InformationPanel {...props} />);
    expect(screen.getByTestId("information-panel")).toHaveClass(
      "clover-viewer-information-panel",
    );
  });

  test("renders a Contents tab when the manifest has structures", () => {
    const { manifest, vault } = createVaultWithStructures();
    mockState = createMockState({
      activeCanvas: "https://example.org/canvas/1",
      activeManifest: manifest.id,
      sequence: sequenceWithTwoCanvases,
      vault,
    });

    render(<InformationPanel {...props} />);

    expect(screen.getByRole("tab", { name: "Contents" })).toBeInTheDocument();
  });

  test("does not render a Contents tab without manifest structures", () => {
    const vault = new Vault();
    const manifest = vault.loadSync("https://example.org/manifest", {
      id: "https://example.org/manifest",
      type: "Manifest",
      label: { none: ["Book"] },
      items: [],
    }) as { id: string };
    mockState = createMockState({
      activeManifest: manifest.id,
      vault,
    });

    render(<InformationPanel {...props} />);

    expect(screen.queryByRole("tab", { name: "Contents" })).toBeNull();
  });

  test("selects the first canvas in a range from the Contents tab", () => {
    const { manifest, vault } = createVaultWithStructures();
    mockState = createMockState({
      activeCanvas: "https://example.org/canvas/1",
      activeManifest: manifest.id,
      informationPanelResource: "manifest-contents",
      sequence: sequenceWithTwoCanvases,
      vault,
    });

    render(<InformationPanel {...props} />);
    fireEvent.click(screen.getByRole("button", { name: "Chapter 2" }));

    expect(mockDispatch).toHaveBeenCalledWith({
      type: "updateActiveCanvas",
      canvasId: "https://example.org/canvas/2",
    });
  });

  test("renders canvas numbers for Contents ranges", () => {
    const { manifest, vault } = createVaultWithStructures();
    mockState = createMockState({
      activeCanvas: "https://example.org/canvas/1",
      activeManifest: manifest.id,
      informationPanelResource: "manifest-contents",
      sequence: sequenceWithTwoCanvases,
      vault,
    });

    render(<InformationPanel {...props} />);

    expect(screen.getByText("1")).toBeInTheDocument();
    expect(screen.getByText("2")).toBeInTheDocument();
    expect(screen.queryByText(/Canvas/)).not.toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Chapter 2" })).toBeTruthy();
  });

  test("selects the first canvas in newspaper ranges with SpecificResource targets", () => {
    const { manifest, vault } = createVaultWithNewspaperStructures();
    mockState = createMockState({
      activeCanvas: newspaperCanvasIds[0],
      activeManifest: manifest.id,
      informationPanelResource: "manifest-contents",
      sequence: sequenceWithFiveCanvases,
      vault,
    });

    render(<InformationPanel {...props} />);

    expect(
      screen.getByRole("button", { name: "Tagesneuigkeiten" }),
    ).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Das Turnier" })).toBeTruthy();
    expect(screen.getByText("2")).toBeInTheDocument();
    expect(screen.getByText("3")).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: "Tagesneuigkeiten" }));

    expect(mockDispatch).toHaveBeenCalledWith({
      type: "updateActiveCanvas",
      canvasId: newspaperCanvasIds[1],
    });
  });
});
