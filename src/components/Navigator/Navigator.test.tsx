import Navigator from "./Navigator";
import React from "react";
import { render, screen } from "@testing-library/react";

describe("Navigator component", () => {
  it("renders", () => {
    render(<Navigator currentTime={1000} />);
    expect(screen.getByTestId("navigator-wrapper"));
  });
});
