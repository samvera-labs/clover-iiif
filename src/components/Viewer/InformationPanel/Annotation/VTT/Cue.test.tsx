import { render, screen } from "@testing-library/react";

import Cue from "src/components/Viewer/InformationPanel/Annotation/VTT/Cue";
import { Group } from "src/components/Viewer/InformationPanel/Annotation/VTT/Cue.styled";
import React from "react";

describe("Information panel cue component", () => {
  it("renders", () => {
    render(
      <Group>
        <Cue html="<div>Text</div>" text="Text" start={107} end={150} />
      </Group>,
    );
    const cue = screen.getByTestId("information-panel-cue");
    expect(cue);
    expect(cue.hasAttribute("aria-checked")).toBe(true);
  });
});
