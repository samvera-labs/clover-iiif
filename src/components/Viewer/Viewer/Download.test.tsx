import { ViewerProvider, defaultState } from "src/context/viewer-context";
import { render, screen } from "@testing-library/react";

import Download from "./Download";
import React from "react";
import { Vault } from "@iiif/vault";
import noRenderingManifest from "src/fixtures/viewer/rendering/manifest-without-renderings.json";
import renderingManifest from "src/fixtures/iiif-cookbook/0046-rendering.json";
import renderingMultipleManifest from "src/fixtures/viewer/rendering/manifest-with-renderings.json";
import userEvent from "@testing-library/user-event";

describe("Viewer Download popover component", () => {
  let vault: Vault;

  beforeEach(() => {
    vault = new Vault();
  });

  it("should render the download button and popover content", async () => {
    const user = userEvent.setup();
    await vault.loadManifest("", renderingManifest);

    render(
      <ViewerProvider
        initialState={{
          ...defaultState,
          activeManifest:
            "https://iiif.io/api/cookbook/recipe/0046-rendering/manifest.json",
          activeCanvas:
            "https://iiif.io/api/cookbook/recipe/0046-rendering/canvas/p1",
          vault,
        }}
      >
        <Download />
      </ViewerProvider>,
    );

    const popoverButton = screen.getByTestId("download-button");

    expect(popoverButton).toBeInTheDocument();
    expect(screen.queryByTestId("download-content")).toBeNull();

    await user.click(popoverButton);

    expect(screen.getByTestId("download-content")).toBeInTheDocument();

    await user.click(popoverButton);

    expect(screen.queryByTestId("download-content")).toBeNull();
  });

  it("should render root level and canvas level rendering items in the download content section", async () => {
    const user = userEvent.setup();
    await vault.loadManifest("", renderingMultipleManifest);

    render(
      <ViewerProvider
        initialState={{
          ...defaultState,
          activeManifest:
            "https://figgy.princeton.edu/concern/scanned_resources/f93c3171-43a6-4db3-9692-ba394d669320/manifest",
          activeCanvas:
            "https://figgy.princeton.edu/concern/scanned_resources/f93c3171-43a6-4db3-9692-ba394d669320/manifest/canvas/f2b05d1c-e02f-43cc-bcfd-2650136288ed",
          vault,
        }}
      >
        <Download />
      </ViewerProvider>,
    );

    await user.click(screen.getByTestId("download-button"));

    expect(screen.getByText("Individual Pages")).toBeInTheDocument();
    expect(screen.getByText("All Pages")).toBeInTheDocument();
    expect(
      screen.getByText("Root Rendering Label (text/html)"),
    ).toBeInTheDocument();
    expect(
      screen.getByText("Download page text (text/plain)"),
    ).toBeInTheDocument();
    expect(
      screen.getByText("Download the original file (image/tiff)"),
    ).toBeInTheDocument();
  });

  it("should not render the download button when no rendering items are present", async () => {
    await vault.loadManifest("", noRenderingManifest);

    render(
      <ViewerProvider
        initialState={{
          ...defaultState,
          activeManifest:
            "https://iiif.io/api/cookbook/recipe/0046-rendering/manifest.json",
          activeCanvas:
            "https://iiif.io/api/cookbook/recipe/0046-rendering/canvas/p1",
          vault,
        }}
      >
        <Download />
      </ViewerProvider>,
    );

    expect(screen.queryByTestId("download-button")).toBeNull();
    expect(screen.queryByTestId("download-content")).toBeNull();
  });
});
