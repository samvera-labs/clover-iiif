import { render, screen } from "@testing-library/react";
import PropertiesMetadata from "@/components/Properties/Metadata";
import React from "react";

const json = [
  {
    label: {
      none: ["Medium"],
    },
    value: {
      none: ["beeswax on panel"],
    },
  },
  {
    label: {
      none: ["Physical Description"],
    },
    value: {
      none: ["Support (PTG): 32 x 39 inches (81.3 x 99.1 cm)"],
    },
  },
  {
    label: {
      none: ["Institution"],
    },
    value: {
      none: ["Yale Center for British Art"],
    },
  },
];

describe("IIIF metadata property component", () => {
  it("renders", () => {
    render(<PropertiesMetadata metadata={json} />);

    /**
     * test datalist
     */
    const terms = screen.getAllByRole("term");
    terms.forEach((element, index) => {
      const text = json[index].label?.none?.join(", ") as string;
      expect(element).toHaveTextContent(text);
    });

    const definitions = screen.getAllByRole("definition");
    definitions.forEach((element, index) => {
      const text = json[index].value?.none?.join(", ") as string;
      expect(element).toHaveTextContent(text);
    });
  });
});
