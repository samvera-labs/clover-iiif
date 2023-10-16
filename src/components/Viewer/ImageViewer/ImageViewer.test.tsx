import ImageViewer from "src/components/Viewer/ImageViewer/ImageViewer";
import React from "react";
import { render } from "@testing-library/react";

describe("ImageViewer component", () => {
  it("renders", () => {
    render(
      <ImageViewer
        painting={{
          id: "https://iiif.stack.rdc.library.northwestern.edu/iiif/2/180682c9-dfaf-4881-b7b6-1f2f21092d4f/full/600,/0/default.jpg",
          type: "Image",
          format: "image/jpeg",
          service: [
            {
              id: "https://iiif.stack.rdc.library.northwestern.edu/iiif/2/180682c9-dfaf-4881-b7b6-1f2f21092d4f",
              profile: "http://iiif.io/api/image/2/level2.json",
              type: "ImageService2",
            },
          ],
          width: 3780,
          height: 4440,
        }}
        hasPlaceholder={false}
      />,
    );
  });
});
