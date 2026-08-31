import { render } from "@testing-library/react";
import React from "react";

import Homepage from "src/components/Primitives/Homepage/Homepage";
import Label from "src/components/Primitives/Label/Label";
import Markup from "src/components/Primitives/Markup/Markup";
import Metadata from "src/components/Primitives/Metadata/Metadata";
import PartOf from "src/components/Primitives/PartOf/PartOf";
import Rendering from "src/components/Primitives/Rendering/Rendering";
import RequiredStatement from "src/components/Primitives/RequiredStatement/RequiredStatement";
import SeeAlso from "src/components/Primitives/SeeAlso/SeeAlso";
import Summary from "src/components/Primitives/Summary/Summary";

const label = { none: ["Ballads"] };
const value = { none: ["Sheet music"] };
const resources = [{ id: "https://example.org/thing", label, type: "Text" }];

/**
 * `as` used to be supplied by Stitches, which re-rendered the styled component
 * under a different tag. It is a plain default-in-destructure now, so these
 * assert the tag a Primitive actually lands on — the one thing that would
 * silently break in the move off Stitches.
 */
describe("Primitives `as` polymorphism", () => {
  /*
   * The fourth entry is the tag to swap to, or null where the type admits only
   * one tag (`as?: "dl"`) and there is nothing to swap.
   */
  const cases: Array<[string, React.ReactElement, string, string | null]> = [
    ["Label", <Label key="label" label={label} />, "SPAN", "H2"],
    ["Markup", <Markup key="markup" markup={value} />, "SPAN", "P"],
    ["Summary", <Summary key="summary" summary={value} />, "SPAN", "P"],
    [
      "Metadata",
      <Metadata key="metadata" metadata={[{ label, value }]} />,
      "DL",
      null,
    ],
    [
      "RequiredStatement",
      <RequiredStatement
        key="required-statement"
        requiredStatement={{ label, value }}
      />,
      "DL",
      null,
    ],
    [
      "SeeAlso",
      <SeeAlso key="see-also" seeAlso={resources as any} />,
      "UL",
      "OL",
    ],
    ["PartOf", <PartOf key="part-of" partOf={resources as any} />, "UL", "OL"],
    [
      "Rendering",
      <Rendering key="rendering" rendering={resources as any} />,
      "UL",
      "OL",
    ],
  ];

  test.each(cases)("%s defaults to <%s>", (_name, element, defaultTag) => {
    const { container } = render(element);
    expect(container.firstElementChild?.tagName).toBe(defaultTag);
  });

  test.each(cases.filter(([, , , asTag]) => asTag))(
    "%s honors `as`",
    (_name, element, _default, asTag) => {
      const { container } = render(
        React.cloneElement(element, { as: asTag!.toLowerCase() } as any),
      );
      expect(container.firstElementChild?.tagName).toBe(asTag);
    },
  );
});

/**
 * Every Primitive forwards `className` to the element it renders.
 *
 * `Label`, `Summary` and `Homepage` are all styled from outside — the Slider's
 * figure titles and its View All link key on classes passed in this way — so a
 * Primitive that dropped `className` would silently lose that styling. It is
 * also what carried these three through the move off Stitches, when the class
 * arriving here was one `styled()` had generated.
 */
describe("Primitives className forwarding", () => {
  it("forwards className to the rendered element", () => {
    const { container } = render(<Label label={label} className="c-abc123" />);
    expect(container.firstElementChild).toHaveClass("c-abc123");
  });

  it("forwards className through Summary to its Markup element", () => {
    const { container } = render(
      <Summary summary={value} className="c-def456" />,
    );
    expect(container.firstElementChild).toHaveClass("c-def456");
  });

  it("forwards className to each Homepage anchor", () => {
    const { container } = render(
      <Homepage homepage={resources as any} className="c-ghi789" />,
    );
    expect(container.querySelector("a")).toHaveClass("c-ghi789");
  });
});
