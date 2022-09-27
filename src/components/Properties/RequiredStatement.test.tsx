import { render, screen } from "@testing-library/react";
import PropertiesRequiredStatement from "@/components/Properties/RequiredStatement";
import React from "react";

const json = {
  label: {
    none: ["Rights Description"],
  },
  value: {
    none: [
      "Metadata describing Yale Center for British Art collections is public domain under CC0. Copyright or other restrictions may apply to cultural works or images of those works in this record.",
    ],
  },
};

describe("IIIF requiredStatement property component", () => {
  it("renders", () => {
    render(<PropertiesRequiredStatement requiredStatement={json} />);

    /**
     * test datalist
     */
    const term = screen.getByRole("term");
    expect(term).toHaveTextContent(json.label.none.join());

    const definition = screen.getByRole("definition");
    expect(definition).toHaveTextContent(json.value.none.join());
  });
});
