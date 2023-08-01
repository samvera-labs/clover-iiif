import { render, screen } from "@testing-library/react";
import PropertiesSummary from "src/components/Viewer/Properties/Summary";
import React from "react";

const json = {
  none: [
    "...we do not deny that in the course of telling it [Hans’ story], we have taken a certain pedagogic liking to you, might be tempted gently to dab the corner of an eye with one fingertip at the thought that we shall neither see you nor hear from you in the future...",
  ],
};

describe("IIIF summary property component", () => {
  it("renders", () => {
    render(<PropertiesSummary summary={json} />);

    /**
     * test paragraph
     */
    const text = json.none?.join(", ") as string;
    const paragraph = screen.getByText(text);
    expect(paragraph.nodeName).toBe("P");
    expect(paragraph).toHaveTextContent(text);
  });
});
