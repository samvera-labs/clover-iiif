import React from "react";
import { render } from "@testing-library/react";
import Player from "./Player";
import { IIIFExternalWebResource } from "@hyperion-framework/types";
import { LabeledResource } from "hooks/use-hyperion-framework/getSupplementingResources";

const mockPainting: IIIFExternalWebResource = {
  id: "https://bitdash-a.akamaihd.net/content/MI201109210084_1/m3u8s/f08e80da-bf1d-4e3d-8899-f0f6155f6efa.m3u8",
  type: "Video",
  format: "video/mp4",
  height: 720,
  width: 480,
  duration: 500,
};
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

describe("Player component", () => {
  const mockFn = jest.fn();

  // Stub to keep Jest from complaining about the play() code from browser API
  window.HTMLMediaElement.prototype.play = () => {
    return Promise.resolve();
  };

  it("renders", () => {
    render(
      <Player
        painting={mockPainting}
        resources={mockResources}
        currentTime={mockFn}
      />,
    );
  });
});
