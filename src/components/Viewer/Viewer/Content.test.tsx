import { render, screen } from "@testing-library/react";

import React from "react";
import ViewerContent from "./Content";

vi.mock("../Painting/Painting", () => ({
  default: () => {
    return <div data-testid="mock-painting">Painting</div>;
  },
}));
vi.mock("src/components/Viewer/InformationPanel/InformationPanel", () => ({
  default: () => {
    return <div data-testid="mock-information-panel">Information Panel</div>;
  },
}));
vi.mock("@radix-ui/react-collapsible", () => ({
  Content: () => {
    return (
      <div data-testid="mock-collapsible-content">Collapsible Content</div>
    );
  },
  Trigger: () => {
    return (
      <div data-testid="mock-collapsible-trigger">Collapsible Trigger</div>
    );
  },
}));

const props = {
  activeCanvas: "foobar",
  painting: [],
  resources: [],
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
