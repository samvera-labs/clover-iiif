import React from "react";
import { render } from "@testing-library/react";
import Player from "@/components/Player/Player";
import { IIIFExternalWebResource } from "@iiif/presentation-3";
import { LabeledResource } from "@/hooks/use-iiif/getSupplementingResources";

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

xdescribe("Player component", () => {
  it("renders", () => {
    render(<Player painting={mockPainting} resources={mockResources} />);
  });
});
