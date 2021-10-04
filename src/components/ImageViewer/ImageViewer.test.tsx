import React from "react";
import { render } from "@testing-library/react";
import ImageViewer from "./ImageViewer";

describe("ImageViewer component", () => {
  it("renders", () => {
    render(
      <ImageViewer
        format="image/jpeg"
        height={1000}
        width={1000}
        id="https://imageurl.com"
        type="Image"
      />,
    );
  });
});
