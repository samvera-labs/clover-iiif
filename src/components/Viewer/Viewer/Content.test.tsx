import { render, screen } from "@testing-library/react";

import InformationPanel from "../InformationPanel/InformationPanel";
import Painting from "src/components/Viewer/Painting/Painting";
import React from "react";
import ViewerContent from "src/components/Viewer/Viewer/Content";

vi.mock("@radix-ui/react-collapsible");

vi.mock("src/components/Viewer/Painting/Painting");
vi.mocked(Painting).mockReturnValue(
  <div data-testid="mock-painting">Painting</div>,
);

vi.mock("src/components/Viewer/InformationPanel/InformationPanel");
vi.mocked(InformationPanel).mockReturnValue(
  <div data-testid="mock-information-panel">Information Panel</div>,
);

const props = {
  activeCanvas: "foobar",
  painting: [],
  resources: [],
  annotationResources: [],
  items: [],
  isAudioVideo: false,
};

describe("ViewerContent", () => {
  test("renders an element with the 'clover-viewer-content' class name", () => {
    render(<ViewerContent {...props} />);
    expect(screen.getByTestId("clover-viewer-content")).toHaveClass(
      "clover-viewer-content",
    );
  });
});
