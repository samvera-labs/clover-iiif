import React from "react";
import ErrorFallback from "src/components/Viewer/Viewer/ErrorFallback";
import { render, screen } from "@testing-library/react";

describe("ErrorFallback component", () => {
  const mockErrorObj = {
    name: "ERROR 123",
    message: "This is the error message",
  };

  test("renders the component", () => {
    render(<ErrorFallback error={mockErrorObj} />);
    expect(screen.getByRole("alert"));
  });

  test("displays the error headline and error message", () => {
    render(<ErrorFallback error={mockErrorObj} />);
    expect(screen.getByTestId("headline"));
    expect(screen.getByText(mockErrorObj.message, { exact: false }));
  });
});
