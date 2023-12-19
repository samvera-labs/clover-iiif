import OSD, { osdImageTypes } from "./OSD";
import { render, screen } from "@testing-library/react";

import React from "react";

const props = {
  uri: "foobar",
  hasPlaceholder: false,
  imageType: "simpleImage" as osdImageTypes,
};

vi.mock("openseadragon", () => ({
  default: () => {
    return {
      addSimpleImage: () => {},
    };
  },
}));

describe("OSD", () => {
  test("renders an element with the 'clover-viewer-osd' class name", () => {
    render(<OSD {...props} />);
    expect(screen.getByTestId("clover-viewer-osd-wrapper")).toHaveClass(
      "clover-viewer-osd-wrapper",
    );
  });
});
