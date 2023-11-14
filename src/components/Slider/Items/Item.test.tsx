import { render, screen } from "@testing-library/react";

import Item from "./Item";
import React from "react";
import { sliderItem } from "src/fixtures/slider/slider-item";

describe("SliderItem", () => {
  test("renders a figure element wrapped by an anchor tag", async () => {
    render(<Item index={0} item={sliderItem} />);
    const el = await screen.findByTestId("slider-item");

    expect(el).toBeInTheDocument();
    expect(screen.getByRole("link")).toHaveAttribute(
      "href",
      sliderItem.homepage[0].id,
    );
    expect(screen.getByRole("figure")).toBeInTheDocument();
  });

  test("handles custom anchor click callback", async () => {
    const mockHandleItemInteraction = vi.fn();
    render(
      <Item
        handleItemInteraction={mockHandleItemInteraction}
        index={0}
        item={sliderItem}
      />,
    );
    const el = await screen.findByTestId("slider-item-anchor");

    el.click();
    expect(mockHandleItemInteraction).toHaveBeenCalledWith(sliderItem);
  });
});
