import Cue from "src/components/Viewer/Navigator/Cue";
import { Group } from "src/components/Viewer/Navigator/Cue.styled";
import React from "react";
import { render, screen } from "@testing-library/react";

describe("Navigator component", () => {
  it("renders", () => {
    render(
      <Group>
        <Cue label="Text" start={107} end={150} />
      </Group>
    );
    const cue = screen.getByTestId("navigator-cue");
    expect(cue);
    expect(cue.hasAttribute("aria-checked")).toBe(true);
  });
});
