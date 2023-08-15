import React from "react";
import { screen, render } from "@testing-library/react";
import PartOf from "src/components/Primitives/PartOf/PartOf";
import { PrimitivesIIIFResource } from "src/types/primitives";

const partOf: PrimitivesIIIFResource[] = [
  {
    id: "https://digital.lib.utk.edu/assemble/collection/collections/rftaart",
    type: "Collection",
    label: { none: ["Parent Collection"] },
  },
  {
    id: "https://digital.lib.utk.edu/assemble/collection/collections/rftacuratedart",
    type: "Collection",
  },
];

describe("partOf primitive", () => {
  it("Renders 3.0 partOf for entries", () => {
    render(<PartOf partOf={partOf} />);

    /**
     * test anchors
     */
    const links = screen.getAllByRole("link");
    links.forEach((element, index) => {
      /**
       * get label if it exists, otherwise fallback to id
       */
      const text = partOf[index].label
        ? (partOf[index].label?.none?.join(", ") as string)
        : (partOf[index].id as string);
      expect(element).toHaveTextContent(text);

      const href = partOf[index].id as string;
      expect(element.getAttribute("href")).toBe(href);
    });
  });
});
