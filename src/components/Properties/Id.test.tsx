import React from "react";
import { render, screen } from "@testing-library/react";
import PropertiesId from "@/components/Properties/Id";

const json = "https://manifests.collections.yale.edu/ycba/obj/21168";
const htmlLabel = "IIIF Manifest";

describe("IIIF id property component", () => {
  it("renders", () => {
    render(<PropertiesId id={json} htmlLabel={htmlLabel} />);

    /**
     * test html text
     */
    expect(screen.getByText(htmlLabel)).toBeDefined;

    /**
     * test anchor
     */
    const link = screen.getByRole("link");
    expect(link).toHaveTextContent(json);
    expect(link.getAttribute("href")).toBe(json);
    expect(link.getAttribute("target")).toBe("_blank");
  });
});
