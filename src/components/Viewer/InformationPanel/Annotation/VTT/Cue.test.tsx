import { render, screen } from "@testing-library/react";

import Cue from "src/components/Viewer/InformationPanel/Annotation/VTT/Cue";
import React from "react";
import * as RadioGroup from "@radix-ui/react-radio-group";

describe("Information panel cue component", () => {
  it("renders", () => {
    render(
      <RadioGroup.Root>
        <Cue html="<div>Text</div>" text="Text" start={107} end={150} />
      </RadioGroup.Root>,
    );
    const cue = screen.getByTestId("information-panel-cue");
    expect(cue);
    expect(cue.hasAttribute("aria-checked")).toBe(true);
  });
});
