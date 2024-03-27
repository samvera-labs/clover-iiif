import { render, screen } from "@testing-library/react";

import About from "src/components/Viewer/InformationPanel/About/About";
import InformationPanel from "src/components/Viewer/InformationPanel/InformationPanel";
import React from "react";

const props = {
  activeCanvas: "foobar",
  resources: [],
  setContentSearchResource: () => {},
};

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
