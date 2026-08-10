/**
 * Map tab coverage for the InformationPanel.
 *
 * These cases previously lived in Painting.test.tsx, where the map used to be
 * rendered. The map now lives in the InformationPanel's "Map" tab, so the
 * navPlace and georeference-overlay behaviour is exercised here instead.
 *
 * The real ViewerProvider is used (rather than a mocked viewer-context) because
 * these assertions depend on state derived from a loaded Vault.
 */

import { ViewerProvider, defaultState } from "src/context/viewer-context";
import { render, screen } from "@testing-library/react";

import InformationPanel from "src/components/Viewer/InformationPanel/InformationPanel";
import Map from "src/components/Map";
import React from "react";
import { Vault } from "@iiif/helpers/vault";
import userEvent from "@testing-library/user-event";

const user = userEvent.setup();

vi.mock("src/components/Viewer/InformationPanel/About/About", () => ({
  __esModule: true,
  default: () => <div data-testid="mock-about">About</div>,
}));

vi.mock("src/components/Map");
vi.mocked(Map).mockReturnValue(<div data-testid="mock-map">Map</div>);

const paintingBody = {
  format: "image/tiff",
  height: 5792,
  id: "https://iiif.dc.library.northwestern.edu/iiif/2/e549a0f6-e4f4-4629-b6e2-f5c434189705/full/600,/0/default.jpg",
  service: [
    {
      id: "https://iiif.dc.library.northwestern.edu/iiif/2/e549a0f6-e4f4-4629-b6e2-f5c434189705",
      "@type": "ImageService2",
      profile: "http://iiif.io/api/image/2/level2.json",
    },
  ],
  type: "Image",
  width: 8688,
};

const renderPanel = ({
  activeCanvas,
  manifestId,
  vault,
  map,
}: {
  activeCanvas: string;
  manifestId: string;
  vault: Vault;
  map: Record<string, unknown>;
}) =>
  render(
    <ViewerProvider
      initialState={{
        ...defaultState,
        activeManifest: manifestId,
        configOptions: {
          ...defaultState.configOptions,
          map: { ...defaultState.configOptions.map, ...map },
        },
        vault,
        visibleCanvases: [{ id: activeCanvas, type: "Canvas" }],
      }}
    >
      <InformationPanel
        activeCanvas={activeCanvas}
        setContentSearchResource={() => {}}
      />
    </ViewerProvider>,
  );

/**
 * The panel forces the "About" tab on mount when a manifest has no annotations,
 * so the Map tab is selected the way a user would select it. Radix only renders
 * the active tab's content, so this is required before the map is in the DOM.
 * `userEvent` is needed here because Radix activates a tab on mousedown.
 */
const openMapTab = async () => {
  await user.click(await screen.findByRole("tab", { name: "Map" }));
  return screen.findByTestId("mock-map");
};

const mapProps = () => vi.mocked(Map).mock.calls.at(-1)?.[0];

describe("InformationPanel map tab", () => {
  it("displays the map with Canvas-level navPlace", async () => {
    const vault = new Vault();
    const activeCanvas = "https://example.org/iiif/canvas/navplace/1";
    const manifest = {
      "@context": "http://iiif.io/api/presentation/3/context.json",
      id: "https://example.org/iiif/manifest/navplace",
      type: "Manifest",
      label: { en: ["Map Manifest"] },
      items: [
        {
          id: activeCanvas,
          type: "Canvas",
          height: 1000,
          width: 1000,
          label: { en: ["Canvas with navPlace"] },
          navPlace: {
            type: "FeatureCollection",
            features: [
              {
                type: "Feature",
                properties: { label: { en: ["Canvas point"] } },
                geometry: { type: "Point", coordinates: [-87.6881, 42.045] },
              },
            ],
          },
          items: [
            {
              id: `${activeCanvas}/page`,
              type: "AnnotationPage",
              items: [
                {
                  id: `${activeCanvas}/annotation`,
                  type: "Annotation",
                  motivation: "painting",
                  body: paintingBody,
                  target: activeCanvas,
                },
              ],
            },
          ],
        },
      ],
    };
    await vault.loadManifest("", manifest);

    renderPanel({
      activeCanvas,
      manifestId: manifest.id,
      vault,
      map: { enabled: true, fitToData: true, navPlaceLevel: "auto" },
    });

    expect(await openMapTab()).toBeInTheDocument();

    // Map options are threaded through to the component.
    expect(mapProps()?.fitToData).toBe(true);

    const navPlace = mapProps()?.navPlace as GeoJSON.FeatureCollection;
    expect(navPlace.type).toBe("FeatureCollection");
    expect(navPlace.features[0].properties?.iiifResource).toMatchObject({
      id: activeCanvas,
      type: "Canvas",
      parent: {
        id: manifest.id,
        type: "Manifest",
      },
    });
  });

  it("displays Manifest-level navPlace when map mode targets the Manifest", async () => {
    const vault = new Vault();
    const activeCanvas = "https://example.org/iiif/canvas/manifest-navplace/1";
    const manifest = {
      "@context": "http://iiif.io/api/presentation/3/context.json",
      id: "https://example.org/iiif/manifest/manifest-navplace",
      type: "Manifest",
      label: { en: ["Manifest with navPlace"] },
      summary: { en: ["Manifest-level map summary"] },
      thumbnail: [{ id: "https://example.org/thumb.jpg", type: "Image" }],
      homepage: [{ id: "https://example.org/work", type: "Text" }],
      navPlace: {
        type: "FeatureCollection",
        features: [
          {
            type: "Feature",
            properties: { label: { en: ["Pend Oreille River"] } },
            geometry: { type: "Point", coordinates: [-117.61775, 49.00381] },
          },
        ],
      },
      items: [
        {
          id: activeCanvas,
          type: "Canvas",
          height: 1000,
          width: 1000,
          label: { en: ["Canvas 1"] },
          items: [
            {
              id: `${activeCanvas}/page`,
              type: "AnnotationPage",
              items: [
                {
                  id: `${activeCanvas}/annotation`,
                  type: "Annotation",
                  motivation: "painting",
                  body: paintingBody,
                  target: activeCanvas,
                },
              ],
            },
          ],
        },
      ],
    };
    await vault.loadManifest("", manifest);

    renderPanel({
      activeCanvas,
      manifestId: manifest.id,
      vault,
      map: { enabled: true, fitToData: true, navPlaceLevel: "Manifest" },
    });

    expect(await openMapTab()).toBeInTheDocument();

    const navPlace = mapProps()?.navPlace as GeoJSON.FeatureCollection;
    expect(navPlace.features[0].properties?.iiifResource).toMatchObject({
      id: manifest.id,
      type: "Manifest",
      label: manifest.label,
      summary: manifest.summary,
      thumbnail: "https://example.org/thumb.jpg",
      homepage: "https://example.org/work",
    });
  });
});

describe("InformationPanel map tab georeference overlays", () => {
  const georefBody = (coords: [number, number][]) => ({
    type: "FeatureCollection",
    features: coords.map((coordinates, index) => ({
      type: "Feature",
      properties: { resourceCoords: [index * 10, index * 10] },
      geometry: { type: "Point", coordinates },
    })),
  });

  const buildCanvas = (
    canvasId: string,
    serviceId: string,
    coords: [number, number][],
  ) => ({
    id: canvasId,
    type: "Canvas",
    height: 1000,
    width: 1000,
    items: [
      {
        id: `${canvasId}/page`,
        type: "AnnotationPage",
        items: [
          {
            id: `${canvasId}/annotation`,
            type: "Annotation",
            motivation: "painting",
            body: {
              id: `${serviceId}/full/600,/0/default.jpg`,
              type: "Image",
              format: "image/jpeg",
              height: 1000,
              width: 1000,
              service: [{ id: serviceId, type: "ImageService2" }],
            },
            target: canvasId,
          },
        ],
      },
    ],
    annotations: [
      {
        id: `${canvasId}/georef-page`,
        type: "AnnotationPage",
        items: [
          {
            id: `${canvasId}/georef`,
            type: "Annotation",
            motivation: "georeferencing",
            target: {
              type: "SpecificResource",
              source: {
                id: canvasId,
                type: "Canvas",
                width: 1000,
                height: 1000,
              },
            },
            body: georefBody(coords),
          },
        ],
      },
    ],
  });

  it("gathers and adapts georef annotations across the manifest for overlays", async () => {
    const vault = new Vault();
    const canvas1 = "https://example.org/iiif/canvas/georef/1";
    const canvas2 = "https://example.org/iiif/canvas/georef/2";
    const service1 = "https://iiif.example.org/image/2/sheet-1";
    const service2 = "https://iiif.example.org/image/2/sheet-2";

    const manifest = {
      "@context": "http://iiif.io/api/presentation/3/context.json",
      id: "https://example.org/iiif/manifest/georef",
      type: "Manifest",
      label: { en: ["Georeferenced Sheets"] },
      items: [
        buildCanvas(canvas1, service1, [
          [-87.71, 42.06],
          [-87.68, 42.06],
          [-87.68, 42.01],
        ]),
        buildCanvas(canvas2, service2, [
          [-87.78, 42.07],
          [-87.7, 42.07],
          [-87.7, 42.08],
        ]),
      ],
    };
    await vault.loadManifest("", manifest);

    renderPanel({
      activeCanvas: canvas1,
      manifestId: manifest.id,
      vault,
      map: {
        enabled: true,
        fitToData: true,
        showImageOverlay: true,
        overlayScope: "manifest",
      },
    });

    expect(await openMapTab()).toBeInTheDocument();

    await vi.waitFor(() =>
      expect(mapProps()?.georefAnnotations ?? []).toHaveLength(2),
    );

    // Each Canvas-sourced annotation is adapted to its painting image service.
    const sources = (mapProps()?.georefAnnotations ?? [])
      .map((annotation) => annotation.target?.source)
      .sort((a, b) => (a?.id ?? "").localeCompare(b?.id ?? ""));
    expect(sources[0]).toMatchObject({ id: service1, type: "ImageService2" });
    expect(sources[1]).toMatchObject({ id: service2, type: "ImageService2" });

    // Overlay options are threaded through.
    expect(mapProps()?.showImageOverlay).toBe(true);
  });

  it("limits overlay discovery to the visible canvas when overlayScope is 'canvas'", async () => {
    const vault = new Vault();
    const canvas1 = "https://example.org/iiif/canvas/scope/1";
    const canvas2 = "https://example.org/iiif/canvas/scope/2";
    const service1 = "https://iiif.example.org/image/2/scope-1";
    const service2 = "https://iiif.example.org/image/2/scope-2";
    const coords: [number, number][] = [
      [-87.7, 42.0],
      [-87.6, 42.0],
      [-87.6, 42.1],
    ];

    const manifest = {
      "@context": "http://iiif.io/api/presentation/3/context.json",
      id: "https://example.org/iiif/manifest/scope",
      type: "Manifest",
      label: { en: ["Scope Test"] },
      items: [
        buildCanvas(canvas1, service1, coords),
        buildCanvas(canvas2, service2, coords),
      ],
    };
    await vault.loadManifest("", manifest);

    renderPanel({
      activeCanvas: canvas1,
      manifestId: manifest.id,
      vault,
      map: {
        enabled: true,
        fitToData: true,
        showImageOverlay: true,
        overlayScope: "canvas",
      },
    });

    expect(await openMapTab()).toBeInTheDocument();

    await vi.waitFor(() =>
      expect(mapProps()?.georefAnnotations ?? []).toHaveLength(1),
    );

    expect(mapProps()?.georefAnnotations?.[0]?.target?.source).toMatchObject({
      id: service1,
    });
  });
});
