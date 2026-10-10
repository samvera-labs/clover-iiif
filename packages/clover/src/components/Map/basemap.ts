/**
 * Clover's default basemap: OpenFreeMap's Liberty vector style (keyless), reshaped for
 * reading old maps and places against: roads removed, and relief from Mapzen's terrain
 * tiles on AWS Open Data drawn under the labels. A `styleUrl` a host passes is used as
 * authored, never reshaped. As 3.x's Map does it.
 */

export const DEFAULT_STYLE_URL = "https://tiles.openfreemap.org/styles/liberty";

const TERRAIN_SOURCE = "geomap-terrain";
const TERRAIN_LAYER = "geomap-hillshade";

const ROADS =
  /road|highway|motorway|trunk|primary|secondary|tertiary|street|bridge|tunnel|railway|transit|aeroway|ferry|shield|path|pier/i;

/** Reshape the loaded default style. Each step is skipped if the style refuses it. */
export function applyDefaultBasemap(map: any): void {
  const layers: Array<{ id: string; type: string }> =
    map.getStyle()?.layers ?? [];
  for (const layer of layers) {
    if (!ROADS.test(layer.id)) continue;
    try {
      map.removeLayer(layer.id);
    } catch {
      // A layer another one depends on stays.
    }
  }
  // Relief under the first label or border, so type stays crisp above it.
  const before = layers.find(
    (layer) => layer.type === "symbol" || /boundary|admin/i.test(layer.id),
  );
  try {
    map.addSource(TERRAIN_SOURCE, {
      type: "raster-dem",
      tileSize: 256,
      tiles: [
        "https://s3.amazonaws.com/elevation-tiles-prod/terrarium/{z}/{x}/{y}.png",
      ],
      encoding: "terrarium",
      maxzoom: 15,
      attribution:
        "Elevation: <a href='https://registry.opendata.aws/terrain-tiles/'>Mapzen Terrain Tiles</a>",
    });
    map.addLayer(
      {
        id: TERRAIN_LAYER,
        type: "hillshade",
        source: TERRAIN_SOURCE,
        paint: {
          "hillshade-exaggeration": 0.3,
          "hillshade-shadow-color": "#6b5b47",
          "hillshade-highlight-color": "#ffffff",
          "hillshade-accent-color": "#8a7a66",
        },
      },
      before && map.getLayer(before.id) ? before.id : undefined,
    );
  } catch {
    // Relief is a nicety.
  }
}
