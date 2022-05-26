import Media from "@/components/Media/Media";
import React from "react";
import { render, screen } from "@testing-library/react";

describe("Media component", () => {
  it("renders", () => {
    render(<Media items={[]} activeItem={0} />);
    const media = screen.getByTestId("media");
    expect(media);
    expect(media.hasAttribute("aria-label")).toBe(true);
  });
});
