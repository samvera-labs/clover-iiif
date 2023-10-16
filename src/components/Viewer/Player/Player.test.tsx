import { describe, it } from "vitest";

import { LabeledIIIFExternalWebResource } from "src/types/presentation-3";
import { LabeledResource } from "src/hooks/use-iiif/getSupplementingResources";
import Player from "src/components/Viewer/Player/Player";
import React from "react";
import { render } from "@testing-library/react";

const mockPainting: LabeledIIIFExternalWebResource[] = [
  {
    id: "https://bitdash-a.akamaihd.net/content/MI201109210084_1/m3u8s/f08e80da-bf1d-4e3d-8899-f0f6155f6efa.mp4",
    type: "Video",
    format: "video/mp4",
    height: 720,
    width: 480,
    duration: 500,
  },
  {
    id: "https://bitdash-a.akamaihd.net/content/MI201109210084_1/m3u8s/42323234432524fsasd24t5.ogv",
    type: "Video",
    format: "video/ogv",
    height: 720,
    width: 480,
    duration: 500,
  },
];

const mockResources: Array<LabeledResource> = [
  {
    id: "https://raw.githubusercontent.com/mathewjordan/mirador-playground/main/assets/iiif/supplementing/new_airliner_en.vtt",
    type: "Text",
    format: "text/vtt",
    label: { en: ["en"] },
    language: "en",
  },
  {
    id: "https://raw.githubusercontent.com/mathewjordan/mirador-playground/main/assets/iiif/supplementing/new_airliner_es.vtt",
    type: "Text",
    format: "text/vtt",
    label: { es: ["es"] },
    language: "en",
  },
];

describe.skip("Player component", () => {
  it("renders", () => {
    render(
      <Player
        allSources={mockPainting}
        painting={mockPainting[0]}
        resources={mockResources}
      />,
    );
  });
});
