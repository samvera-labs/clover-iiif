import { render, screen } from "@testing-library/react";

import Body from "./Body";
import { EmbeddedResource } from "@iiif/presentation-3";
import React from "react";

const body: EmbeddedResource = {
  type: "TextualBody",
  id: "https://body-id",
  format: "text/plain",
  value:
    "This is sample body content. \n Second line of body. \n Third line of body.",
};

describe("Body", () => {
  it("should render plain text line breaks as HTML breaks", () => {
    render(<Body body={body} />);

    const renderedBody = screen.getByTestId("scroll-item-body");

    expect(renderedBody).toBeInTheDocument();
    expect(renderedBody.innerHTML).toBe(
      "This is sample body content. <br> Second line of body. <br> Third line of body.",
    );
  });
});
