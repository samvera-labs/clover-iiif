import { fireEvent, render, screen } from "@testing-library/react";

import Header from "./Header";
import React from "react";

const headerProps = {
  label: {
    none: ["Edward S. Curtis's The North American Indian"],
  },
  summary: {
    none: ["Edward Sheriff Curtis published The North America…"],
  },
  // `instance` is gone: Header no longer needs an id to be found by class.
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

  test("prev/next invoke the track callbacks", () => {
    const onScrollPrev = vi.fn();
    const onScrollNext = vi.fn();
    render(
      <Header
        {...headerProps}
        canScrollPrev
        canScrollNext
        onScrollPrev={onScrollPrev}
        onScrollNext={onScrollNext}
      />,
    );

    fireEvent.click(screen.getByLabelText(/previous/i, { selector: "button" }));
    fireEvent.click(screen.getByLabelText(/next/i, { selector: "button" }));

    expect(onScrollPrev).toHaveBeenCalledTimes(1);
    expect(onScrollNext).toHaveBeenCalledTimes(1);
  });

  test("controls are disabled at the ends of the track", () => {
    render(<Header {...headerProps} canScrollPrev={false} canScrollNext />);

    expect(
      screen.getByLabelText(/previous/i, { selector: "button" }),
    ).toBeDisabled();
    expect(
      screen.getByLabelText(/next/i, { selector: "button" }),
    ).toBeEnabled();
  });
});
