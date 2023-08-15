import { render, screen } from "@testing-library/react";

import Figure from "./Figure";
import React from "react";

const figure = {
  index: 1,
  isFocused: false,
  label: {
    none: ["Fish Shows - Apsaroke"],
  },
  summary: {
    none: ["Mollit ullamco quis exercitation voluptate."],
  },
  status: 200,
  thumbnail: [
    {
      id: "https://api.dc.library.northwestern.edu/api/v2/works/fea55bcc-ec7e-4f22-9c70-9d7c1b37ae93/thumbnail",
      format: "image/jpeg",
      type: "Image",
      width: 400,
      height: 400,
    },
  ],
};

describe("Figure component", () => {
  test("renders title and summary with no icon for a regular public resource", () => {
    render(<Figure {...figure} />);
    expect(screen.getByRole("figure")).toHaveTextContent(figure.label.none[0]);
    expect(screen.getByRole("figure")).toHaveTextContent(
      figure.summary.none[0]
    );

    // No status icon expected for regular 200 response
    expect(screen.queryByTestId("status-icon")).toBeNull();
  });

  test("renders a status icon to indicate a non-200 response", () => {
    const non200Figure = { ...figure, status: 404 };
    render(<Figure {...non200Figure} />);
    expect(screen.getByTestId("status-icon")).toBeInTheDocument();
  });

  test("renders the thumbnail component", async () => {
    render(<Figure {...figure} />);
    expect(screen.getByTestId("figure-thumbnail")).toBeInTheDocument();
  });
});
