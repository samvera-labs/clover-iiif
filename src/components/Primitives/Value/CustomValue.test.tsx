import CustomValue from "src/components/Primitives/Value/CustomValue";
import { CustomValueSubject } from "src/fixtures/custom";
import { PrimitivesProvider } from "src/context/primitives-context";
import React from "react";
import { render } from "@testing-library/react";

const value = {
  none: [`Honey`, "Bee"],
};

describe("metadata (CustomValue)", () => {
  it("Test rendering of html in metadata value", () => {
    const { getAllByRole } = render(
      <PrimitivesProvider>
        <CustomValue
          value={value}
          customValueContent={<CustomValueSubject />}
        />
      </PrimitivesProvider>
    );

    const links = getAllByRole("link");
    links.forEach((element, i) => {
      expect(element.getAttribute("href")).toBe(
        `https://example.org/?subject=${value.none[i]}`
      );
      expect(element).toHaveTextContent(value.none[i]);
    });
  });
});
