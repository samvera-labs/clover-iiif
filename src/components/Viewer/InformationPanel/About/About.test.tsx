import { ViewerProvider, createDefaultState } from "src/context/viewer-context";
import { render, screen } from "@testing-library/react";

import About from "src/components/Viewer/InformationPanel/About/About";
import React from "react";
import { Vault } from "@iiif/helpers/vault";
import { manifestImage } from "src/fixtures/viewer/manifest-image";

const canvasId =
  "https://api.dc.library.northwestern.edu/api/v2/works/71153379-4283-43be-8b0f-4e7e3bfda275?as=iiif/canvas/access/2";

async function renderAbout(renderCanvasSummary?: boolean) {
  const vault = new Vault();
  const manifest = await vault.loadManifest("", manifestImage);

  // Canvases in this fixture carry no summary, so give one to the active canvas.
  const canvas = vault.get(canvasId) as { summary?: unknown };
  canvas.summary = { none: ["A description of this particular image"] };

  const initialState = createDefaultState();
  initialState.vault = vault;
  initialState.activeManifest = manifest?.id as string;
  initialState.activeCanvas = canvasId;
  if (renderCanvasSummary !== undefined)
    initialState.configOptions.informationPanel = {
      ...initialState.configOptions.informationPanel,
      renderCanvasSummary,
    };

  render(
    <ViewerProvider initialState={initialState}>
      <About />
    </ViewerProvider>,
  );
}

describe("About", () => {
  it("omits the canvas summary by default", async () => {
    await renderAbout();
    expect(
      screen.queryByText("A description of this particular image"),
    ).not.toBeInTheDocument();
  });

  it("renders the canvas summary when opted in", async () => {
    await renderAbout(true);
    expect(
      await screen.findByText("A description of this particular image"),
    ).toBeInTheDocument();
  });
});
