import React from "react";
import { render, screen } from "@testing-library/react";
import PropertiesHomepage from "@/components/Properties/Homepage";
import { NectarExternalWebResource } from "@samvera/nectar-iiif/dist/types/nectar";

const json: NectarExternalWebResource[] = [
  {
    format: "text/html",
    id: "https://collections.britishart.yale.edu/catalog/tms:21168",
    label: {
      none: [
        "catalog entry at the Yale Center for British Art",
        "additional entry",
      ],
    },
    type: "Text",
  },
];

describe("IIIF homepage property component", () => {
  it("renders", () => {
    render(<PropertiesHomepage homepage={json} />);

    /**
     * test anchors
     */
    const links = screen.getAllByRole("link");
    links.forEach((element, index) => {
      const text = json[index].label?.none?.join(", ") as string;
      expect(element).toHaveTextContent(text);

      const href = json[index].id as string;
      expect(element.getAttribute("href")).toBe(href);
    });
  });
});
