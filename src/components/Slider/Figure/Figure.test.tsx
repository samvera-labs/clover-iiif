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
  test("renders title and summary ", () => {
    render(<Figure {...figure} />);
    expect(screen.getByRole("figure")).toHaveTextContent(figure.label.none[0]);
    expect(screen.getByRole("figure")).toHaveTextContent(
      figure.summary.none[0],
    );
  });

  test("renders the thumbnail component", async () => {
    render(<Figure {...figure} />);
    expect(screen.getByTestId("figure-thumbnail")).toBeInTheDocument();
  });
});
