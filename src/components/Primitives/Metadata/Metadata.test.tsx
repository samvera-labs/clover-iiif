import React from "react";
import { render, screen } from "@testing-library/react";
import Metadata from "src/components/Primitives/Metadata/Metadata";

const metadata = [
  {
    label: {
      none: ["Alternate Title"],
    },
    value: {
      none: ["Fava"],
    },
  },
  {
    label: {
      none: ["Subject"],
    },
    value: {
      none: [
        "Masks",
        "Commedia dell'arte",
        "Italian drama (Comedy)",
        "Pantaloon (Fictitious character)",
      ],
    },
  },
];

describe("Metadata component", () => {
  it("renders expected number of items", () => {
    render(<Metadata metadata={metadata} data-testid="metadata-wrapper" />);
    const dl = screen.getByTestId("metadata-wrapper");
    expect(dl.childElementCount).toEqual(2);
  });

  it("renders a default and custom value delimiter", () => {
    render(<Metadata metadata={metadata} />);
    expect(screen.getByText(metadata[1].value.none.join(", ")));

    render(<Metadata metadata={metadata} customValueDelimiter="!" />);
    expect(screen.getByText(metadata[1].value.none.join("!")));

    render(<Metadata metadata={metadata} customValueDelimiter="abc def" />);
    expect(screen.getByText(metadata[1].value.none.join("abc def")));
  });
});
