import React from "react";
import { act, render, screen } from "@testing-library/react";
import { Vault } from "@iiif/helpers/vault";
import { ViewerProvider, defaultState } from "src/context/viewer-context";
import manifest from "src/fixtures/iiif-cookbook/0013-placeholderCanvas.json";
import CustomPlayer from "./CustomPlayer";
import { LabeledIIIFExternalWebResource } from "src/types/presentation-3";

// Keep the lazy subtree suspended to represent a slow player chunk download.
vi.mock("./PlayerMedia", () => ({
  default: () => {
    throw new Promise(() => {});
  },
}));

it("shows the recipe's placeholder while the player chunk is still loading", async () => {
  const vault = new Vault();
  await vault.loadManifest(manifest.id, structuredClone(manifest));
  const canvas = manifest.items[0];
  const painting = canvas.items[0].items[0]
    .body as LabeledIIIFExternalWebResource;
  render(
    <ViewerProvider
      initialState={{
        ...defaultState,
        vault,
        activeManifest: manifest.id,
        activeCanvas: canvas.id,
      }}
    >
      <CustomPlayer
        painting={painting}
        allSources={[painting]}
        annotationResources={[]}
      />
    </ViewerProvider>,
  );
  await act(() => vi.dynamicImportSettled());
  const image = screen.getByTestId("player-loading").querySelector("img");
  expect(image).toHaveAttribute(
    "src",
    canvas.placeholderCanvas.items[0].items[0].body.id,
  );
  expect(image).toHaveAttribute("data-visible");
});
