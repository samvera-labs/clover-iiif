import Navigator from "@/components/Navigator/Navigator";
import React from "react";
import { render, screen } from "@testing-library/react";

describe("Navigator component", () => {
  it("renders", () => {
    render(
      <Navigator
        activeCanvas="https://raw.githubusercontent.com/mathewjordan/mirador-playground/main/assets/iiif/manifest/assortedCanvases/canvas/0"
        defaultResource="https://raw.githubusercontent.com/mathewjordan/mirador-playground/main/assets/iiif/supplementing/new_airliner_en.vtt"
        resources={[]}
      />,
    );
    expect(screen.getByTestId("navigator"));
    const list = screen.getByTestId("navigator-list");
    expect(list);
    expect(list.hasAttribute("aria-label")).toBe(true);
  });
});
