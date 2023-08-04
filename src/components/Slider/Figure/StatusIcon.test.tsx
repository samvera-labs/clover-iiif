import { render, screen } from "@testing-library/react";

import React from "react";
import StatusIcon from "./StatusIcon";

describe("StatusIcon component", () => {
  test("renders the status icon and shows a restricted icon for 403 code", () => {
    render(<StatusIcon status={403} />);
    expect(screen.getByTestId("status-icon")).toBeInTheDocument();
    expect(screen.getByTitle(/restricted item/i)).toBeInTheDocument();
  });

  test("renders unknown icon for non-403 status", () => {
    render(<StatusIcon status={404} />);
    expect(screen.queryByTitle(/unknown item/i)).toBeNull();
    expect(screen.queryByTitle(/unknown status/i)).toBeInTheDocument();
  });
});
