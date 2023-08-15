import { render, screen } from "@testing-library/react";
import { IIIFExternalWebResource } from "@iiif/presentation-3";
import PropertiesThumbnail from "src/components/Viewer/Properties/Thumbnail";
import React from "react";

const json = [
  {
    id: "https://media.collections.yale.edu/thumbnail/ycba/a1333c03-be5b-4f5b-a897-7e15e3d17b29",
    type: "Image",
    width: 480,
    height: 391,
    service: [
      {
        id: "https://media.collections.yale.edu/thumbnail/ycba/a1333c03-be5b-4f5b-a897-7e15e3d17b29",
        type: "ImageService2",
        profile: "level0",
      },
    ],
  },
] as IIIFExternalWebResource[];

const label = {
  none: ["recto, cropped to image"],
};

describe("IIIF thumbnail property component", () => {
  it("renders", () => {
    render(<PropertiesThumbnail thumbnail={json} label={label} />);

    /**
     * test image
     */
    const image = screen.getByRole("img");
    expect(image.getAttribute("alt")).toBe(label.none.join());
    expect(image.getAttribute("src")).toBe(
      "https://media.collections.yale.edu/thumbnail/ycba/a1333c03-be5b-4f5b-a897-7e15e3d17b29/full/480,391/0/default.jpg"
    );
  });
});
