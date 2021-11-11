import Cue from "./Cue";
import { Group } from "./Cue.styled";
import React from "react";
import { render, screen } from "@testing-library/react";

describe("Navigator component", () => {
  it("renders", () => {
    render(
      <Group>
        <Cue label="Text" startTime="1:47" time={107} isActive={true} />
      </Group>,
    );
    const cue = screen.getByTestId("navigator-cue");
    expect(cue);
    expect(cue.hasAttribute("aria-checked")).toBe(true);
  });
});
