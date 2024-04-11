import { render, screen } from "@testing-library/react";
import { PrimitivesExternalWebResource } from "src/types/primitives";
import PropertiesRendering from "src/components/Viewer/Properties/Rendering";
import React from "react";

const json: PrimitivesExternalWebResource[] = [
  {
    id: "https://drive.google.com/file/d/1aWo1lORRVTQ0VveV3aP5Ym6hfVXUqr8_/view?usp=sharing",
    type: "Text",
    label: {
      en: ['Download "A study guide: Josh MacPhee"'],
    },
    format: "application/pdf",
  },
  {
    id: "https://fixtures.iiif.io/other/UCLA/kabuki_ezukushi_rtl.pdf",
    type: "Text",
    label: {
      en: ["PDF version"],
    },
    format: "application/pdf",
  },
];

describe("IIIF rendering property component", () => {
  it("renders", () => {
    render(<PropertiesRendering rendering={json} />);

    /**
     * test anchors
     */
    const links = screen.getAllByRole("link");
    links.forEach((element, index) => {
      const text = json[index].label?.en?.join(", ") as string;
      expect(element).toHaveTextContent(text);

      const href = json[index].id as string;
      expect(element.getAttribute("href")).toBe(href);
    });
  });
});
