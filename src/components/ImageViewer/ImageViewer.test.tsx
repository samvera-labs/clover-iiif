import React from "react";
import { render } from "@testing-library/react";
import ImageViewer from "./ImageViewer";

describe("ImageViewer component", () => {
  it("renders", () => {
    render(
      <ImageViewer
        id="https://iiif.stack.rdc-staging.library.northwestern.edu/iiif…/6ce3a851-4e9e-43e5-a142-20ffc6a01e56/full/max/0/default.jpg"
        service={[
          {
            id: "https://iiif.stack.rdc-staging.library.northwestern.edu/iiif/2/6ce3a851-4e9e-43e5-a142-20ffc6a01e56",
            profile: "http://iiif.io/api/image/2/level2.json",
            type: "ImageService2",
          },
        ]}
        type="Image"
      />,
    );
  });
});
