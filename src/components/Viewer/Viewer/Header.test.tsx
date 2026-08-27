import { ViewerProvider, defaultState } from "src/context/viewer-context";
import { render, screen } from "@testing-library/react";

import Header from "./Header";
import React from "react";
import { Vault } from "@iiif/helpers/vault";
import noRenderingManifest from "src/fixtures/viewer/rendering/manifest-without-renderings.json";
import renderingManifest from "src/fixtures/iiif-cookbook/0046-rendering.json";

const MANIFEST_ID =
  "https://iiif.io/api/cookbook/recipe/0046-rendering/manifest.json";
const CANVAS_ID =
  "https://iiif.io/api/cookbook/recipe/0046-rendering/canvas/p1";

const OPTIONS = ".clover-viewer-header-options";

describe("Viewer Header options bar", () => {
  let vault: Vault;

  beforeEach(() => {
    vault = new Vault();
  });

  const renderHeader = (configOptions: Record<string, unknown>) =>
    render(
      <ViewerProvider
        initialState={{
          ...defaultState,
          activeManifest: MANIFEST_ID,
          activeCanvas: CANVAS_ID,
          configOptions: { ...defaultState.configOptions, ...configOptions },
          vault,
        }}
      >
        <Header manifestId={MANIFEST_ID} manifestLabel={{ none: ["Title"] }} />
      </ViewerProvider>,
    );

  /*
   * The bug this covers: `showDownload` says the consumer wants the button, not that the
   * resource has any `rendering` to offer. The bar used to render on the option alone, and
   * since it carries padding and grows to fill the row, it left an invisible box.
   */
  it("is not rendered when download is the only option and there is nothing to download", async () => {
    await vault.loadManifest("", noRenderingManifest);

    renderHeader({ showDownload: true, showIIIFBadge: false });

    expect(document.querySelector(OPTIONS)).toBeNull();
    expect(screen.queryByTestId("download-button")).toBeNull();
  });

  it("is rendered when the resource has renderings to download", async () => {
    await vault.loadManifest("", renderingManifest);

    renderHeader({ showDownload: true, showIIIFBadge: false });

    expect(document.querySelector(OPTIONS)).not.toBeNull();
    expect(screen.getByTestId("download-button")).toBeInTheDocument();
  });

  it("is still rendered for the IIIF badge when there is nothing to download", async () => {
    await vault.loadManifest("", noRenderingManifest);

    renderHeader({ showDownload: true, showIIIFBadge: true });

    expect(document.querySelector(OPTIONS)).not.toBeNull();
    expect(screen.queryByTestId("download-button")).toBeNull();
  });
});
