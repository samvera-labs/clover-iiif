// Write a unit test for whether the InformationPanel component renders correctly and also renders an element with the 'clover-viewer-information-panel' class name.

import { render, screen } from "@testing-library/react";

import InformationPanel from "./InformationPanel";
import React from "react";

const props = {
  activeCanvas: "foobar",
  resources: [],
};

vi.mock("src/components/Viewer/InformationPanel/Resource", () => ({
  default: () => {
    return <div data-testid="mock-resource">Resource</div>;
  },
}));
vi.mock("src/components/Viewer/InformationPanel/About/About", () => ({
  default: () => {
    return <div data-testid="mock-information">Information</div>;
  },
}));

describe("InformationPanel", () => {
  test("renders an element with the 'clover-viewer-information-panel' class name", () => {
    render(<InformationPanel {...props} />);
    expect(screen.getByTestId("information-panel")).toHaveClass(
      "clover-viewer-information-panel",
    );
  });
});
