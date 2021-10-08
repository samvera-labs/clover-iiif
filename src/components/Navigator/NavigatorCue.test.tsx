import NavigatorCue from "./NavigatorCue";
import React from "react";
import { render, screen } from "@testing-library/react";

describe("Navigator component", () => {
  it("renders", () => {
    render(<NavigatorCue label="Some Text" startTime="1:47" t={107} />);
    expect(screen.getByTestId("navigator-cue"));
  });
});
