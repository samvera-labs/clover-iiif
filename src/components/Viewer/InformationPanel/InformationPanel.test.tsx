// Write a unit test for whether the InformationPanel component renders correctly and also renders an element with the 'clover-viewer-information-panel' class name.

import { render, screen } from "@testing-library/react";

import About from "src/components/Viewer/InformationPanel/About/About";
import InformationPanel from "src/components/Viewer/InformationPanel/InformationPanel";
import React from "react";
import Resource from "./Resource";

const props = {
  activeCanvas: "foobar",
  resources: [],
};

vi.mock("src/components/Viewer/InformationPanel/Resource");
vi.mocked(Resource).mockReturnValue(
  <div data-testid="mock-resource">Resource</div>,
);

vi.mock("src/components/Viewer/InformationPanel/About/About");
vi.mocked(About).mockReturnValue(<div data-testid="mock-about">About</div>);

describe("InformationPanel", () => {
  test("renders an element with the 'clover-viewer-information-panel' class name", () => {
    render(<InformationPanel {...props} />);
    expect(screen.getByTestId("information-panel")).toHaveClass(
      "clover-viewer-information-panel",
    );
  });
});
