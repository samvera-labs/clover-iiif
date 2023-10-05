import { render, screen } from "@testing-library/react";

import Header from "./Header";
import React from "react";

const headerProps = {
  label: {
    none: ["Edward S. Curtis's The North American Indian"],
  },
  summary: {
    none: ["Edward Sheriff Curtis published The North America…"],
  },
  instance: 1588237267,
};

const navControlLabels = [/previous/i, /next/i];

describe("Header component", () => {
  test("renders the header and baseline components", () => {
    render(<Header {...headerProps} />);
    expect(screen.getByTestId("slider-header")).toBeInTheDocument();
  });

  test("renders navigation controls", () => {
    render(<Header {...headerProps} />);

    // Navigation controls
    navControlLabels.forEach((label) => {
      expect(
        screen.getByLabelText(label, { selector: "button" }),
      ).toBeInTheDocument();
    });
  });

  test("renders linked homepage title and view all button if homepage is present", () => {
    const headerWithHomepage = {
      ...headerProps,
      homepage: [{ format: "text/html", id: "https://dc.library.north…" }],
    };
    render(<Header {...headerWithHomepage} />);

    expect(
      screen.getByRole("link", { name: /edward s. curtis/i }),
    ).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /view all/i })).toBeInTheDocument();
  });

  test("renders summary if present", () => {
    const { rerender } = render(<Header {...headerProps} />);
    expect(screen.getByText(headerProps.summary.none[0])).toBeInTheDocument();

    const noSummaryProps = { ...headerProps, summary: { none: ["aaa"] } };

    rerender(<Header {...noSummaryProps} />);
    expect(screen.queryByText(headerProps.summary.none[0])).toBeNull();
  });
});
