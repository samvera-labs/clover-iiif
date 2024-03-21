import { render, screen } from "@testing-library/react";

import React from "react";
import Select from "./Select";
import SelectOption from "./Option";

const resources = [
  {
    label: { en: ["Resource 1"] },
    value: "resource-1",
  },
  {
    label: { en: ["Resource 2"] },
    value: "resource-2",
  },
];

describe("Select", () => {
  test("select option with a visible button", () => {
    render(
      <Select
        label={{ en: ["iiif label"] }}
        value="resource-1"
        maxHeight="500px"
      >
        {resources.map((resource) => (
          <SelectOption
            value={resource?.value}
            key={resource?.value}
            label={resource?.label}
          />
        ))}
      </Select>,
    );
    expect(screen.getByTestId("select-button")).toBeInTheDocument();
    expect(screen.getByTestId("select-button-value")).toHaveTextContent(
      "Resource 1",
    );
  });
});
