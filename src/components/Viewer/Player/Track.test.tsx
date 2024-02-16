import { render, screen } from "@testing-library/react";

import { LabeledIIIFExternalWebResource } from "src/types/presentation-3";
import React from "react";
import Track from "src/components/Viewer/Player/Track";

const mockResourceCaptions: LabeledIIIFExternalWebResource = {
  id: "https://raw.githubusercontent.com/mathewjordan/mirador-playground/main/assets/iiif/supplementing/new_airliner_en.vtt",
  type: "Text",
  format: "text/vtt",
  label: { en: ["Captions"] },
  language: "en",
};

const mockResourceChapters: LabeledIIIFExternalWebResource = {
  id: "https://raw.githubusercontent.com/mathewjordan/mirador-playground/main/assets/iiif/supplementing/new_airliner_en.vtt",
  type: "Text",
  format: "text/vtt",
  label: { en: ["Chapters"] },
  language: "en",
};

describe("Player component", () => {
  it("Renders Video <track> for caption resource", async () => {
    render(<Track resource={mockResourceCaptions} ignoreCaptionLabels={[]} />);
    const el = await screen.findByTestId("player-track");
    expect(el);
  });

  it("Renders Video <track> for chapters resource", async () => {
    render(<Track resource={mockResourceChapters} ignoreCaptionLabels={[]} />);
    const el = await screen.findByTestId("player-track");
    expect(el);
  });

  it("Ignores rendering Video <track> for configured resource values.", async () => {
    render(
      <Track
        resource={mockResourceChapters}
        ignoreCaptionLabels={["Chapters"]}
      />,
    );

    const el = screen.queryByTestId("player-track");
    expect(el).not.toBeInTheDocument();
  });
});
