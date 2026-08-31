import { render, screen } from "@testing-library/react";

import Cue from "src/components/Viewer/InformationPanel/Annotation/VTT/Cue";
import * as RadioGroup from "@radix-ui/react-radio-group";
import React from "react";

describe("Information panel cue component", () => {
  it("renders", () => {
    render(
      /*
       * The wrapper is only here for RadioGroup context — a `RadioGroup.Item` throws
       * without a Root. It was the styled `Group` before; the styling is now a class on
       * the Root, which this test has no reason to care about.
       */
      <RadioGroup.Root>
        <Cue html="<div>Text</div>" text="Text" start={107} end={150} />
      </RadioGroup.Root>,
    );
    const cue = screen.getByTestId("information-panel-cue");
    expect(cue);
    expect(cue.hasAttribute("aria-checked")).toBe(true);
    // The row shape is shared with an annotation item; the cue adds its own class.
    expect(cue).toHaveClass("clover-annotation-row", "clover-viewer-vtt-cue");
  });
});
