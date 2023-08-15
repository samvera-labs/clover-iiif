import React from "react";
import { render } from "@testing-library/react";
import Homepage from "src/components/Primitives/Homepage/Homepage";
import { PrimitivesExternalWebResource } from "src/types/primitives";

const homepage: PrimitivesExternalWebResource[] = [
  {
    id: "https://en.wikipedia.org/wiki/Western_honey_bee",
    type: "Text",
    label: { none: ["Apis mellifera"], en: ["Western honey bee"] },
    format: "text/html",
  },
];

describe("homepage primitive", () => {
  it("Renders 3.0 homepage as div wrapping resources", async () => {
    const { getByTestId } = render(
      <Homepage data-testid="Primitives-homepage" homepage={homepage} />
    );
    const el = getByTestId("Primitives-homepage");
    expect(el.tagName).toBe("A");
    expect(el).toHaveTextContent("Apis mellifera");
    expect(el).toBeInTheDocument();
  });
  it("Renders 3.0 homepage text content as expected BCP47 lang", async () => {
    const { getByTestId } = render(
      <Homepage
        data-testid="Primitives-homepage"
        homepage={homepage}
        lang="en"
      />
    );
    const el = getByTestId("Primitives-homepage");
    expect(el.tagName).toBe("A");
    expect(el).toHaveTextContent("Western honey bee");
    expect(el).toBeInTheDocument();
  });
  it("Renders 3.0 homepage with aria label on anchor wrapping child text content", async () => {
    const { getByTestId } = render(
      <Homepage data-testid="Primitives-homepage" homepage={homepage}>
        sweet child o' mine
      </Homepage>
    );
    const el = getByTestId("Primitives-homepage");
    expect(el.tagName).toBe("A");
    expect(el).toHaveAttribute("aria-label");
    expect(el).toHaveTextContent("sweet child o' mine");
    expect(el.getAttribute("aria-label")).toBe("Apis mellifera");
  });
});
