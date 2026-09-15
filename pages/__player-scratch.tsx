import React from "react";
import Viewer from "docs/components/DynamicImports/Viewer";

/**
 * Scratch page for looking at the custom player. Not linked from the docs nav.
 *
 * Reads the query string directly rather than `router.query`: under `output: "export"` the
 * router's query is empty on the first client render, so a value derived from it renders the
 * default and never corrects.
 */
const MANIFESTS: Record<string, string> = {
  // IIIF Cookbook 0219 — video with a supplementing WebVTT caption file.
  captions:
    "https://iiif.io/api/cookbook/recipe/0219-using-caption-file/manifest.json",
  // Cookbook 0074 — one caption track per language, wrapped in a Choice.
  multilang:
    "https://iiif.io/api/cookbook/recipe/0074-multiple-language-captions/manifest.json",
  // Mixed: one HLS video canvas followed by four image canvases.
  mixed:
    "https://api.dc.library.northwestern.edu/api/v2/works/684e4649-6d75-48ed-bb13-4ef286df9a2f?as=iiif",
};

/**
 * Themes applied to an ancestor of the Viewer, the way a consumer would. Nothing is passed
 * as a prop — the point is to check what reaches the player through the cascade alone.
 */
const THEMES: Record<string, React.CSSProperties> = {
  none: {},
  // Colour and shape tokens only.
  colors: {
    ["--clover-color-accent" as any]: "#C62828",
    ["--clover-color-primary" as any]: "#37474F",
    ["--clover-color-secondary" as any]: "#FFF8E1",
    ["--clover-radius" as any]: "10px",
    ["--clover-radius-pill" as any]: "4px",
  },
  // Font only. There is no font token by design — Clover inherits type from its container.
  font: {
    fontFamily: "Georgia, 'Times New Roman', serif",
  },
  // Everything, including the player's own overlay palette.
  full: {
    ["--clover-color-accent" as any]: "#00E5A0",
    ["--clover-color-primary" as any]: "#102A43",
    ["--clover-color-secondary" as any]: "#F0F4F8",
    ["--clover-radius" as any]: "12px",
    ["--clover-player-surface" as any]: "#102A43",
    ["--clover-player-on-surface" as any]: "#00E5A0",
    ["--clover-player-text" as any]: "#00E5A0",
    ["--clover-player-menu-surface" as any]: "#0B1B2B",
    fontFamily: "'Courier New', monospace",
  },
};

export default function PlayerScratch() {
  const [params, setParams] = React.useState<{
    m: string;
    controls: string;
    theme: string;
  } | null>(null);

  React.useEffect(() => {
    const search = new URLSearchParams(window.location.search);
    setParams({
      m: search.get("m") || "captions",
      controls: search.get("controls") || "custom",
      theme: search.get("theme") || "none",
    });
  }, []);

  if (!params) return null;

  const { m, controls, theme } = params;
  const href = (o: Partial<typeof params>) =>
    `/__player-scratch?m=${o.m ?? m}&controls=${o.controls ?? controls}&theme=${
      o.theme ?? theme
    }`;

  return (
    <div style={{ padding: "1.5rem", maxWidth: 900, margin: "0 auto" }}>
      <div
        style={{
          display: "flex",
          gap: "0.75rem",
          marginBottom: "0.75rem",
          flexWrap: "wrap",
          fontSize: 14,
        }}
      >
        {Object.keys(MANIFESTS).map((k) => (
          <a key={k} href={href({ m: k })}>
            {k}
          </a>
        ))}
        <span>|</span>
        <a href={href({ controls: "native" })}>native</a>
        <a href={href({ controls: "custom" })}>custom</a>
        <span>|</span>
        {Object.keys(THEMES).map((k) => (
          <a key={k} href={href({ theme: k })}>
            {k}
          </a>
        ))}
      </div>

      <div data-theme-scope={theme} style={THEMES[theme] ?? {}}>
        <Viewer
          key={`${m}-${controls}-${theme}`}
          iiifContent={MANIFESTS[m]}
          options={{
            player: { controls: controls as "native" | "custom" },
            informationPanel: { open: true, renderSupplementing: true },
          }}
        />
      </div>
    </div>
  );
}
