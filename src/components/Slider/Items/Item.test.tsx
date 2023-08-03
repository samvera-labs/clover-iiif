import { render, screen, waitFor } from "@testing-library/react";

import Item from "./Item";
import React from "react";
import { sliderItem } from "src/fixtures/slider/slider-item";

describe("SliderItem", () => {
  test("renders a figure element wrapped by an anchor tag", async () => {
    // mock getResponseStatus() to return 200
    vi.mock("src/lib/get-response-status", () => {
      return {
        getResponseStatus: vi.fn().mockResolvedValue(200),
      };
    });

    render(<Item index={0} item={sliderItem} />);
    const el = await screen.findByTestId("slider-item");

    expect(el).toBeInTheDocument();
    expect(screen.getByRole("link")).toHaveAttribute(
      "href",
      sliderItem.homepage[0].id
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
      />
    );
    const el = await screen.findByTestId("slider-item-anchor");

    el.click();
    expect(mockHandleItemInteraction).toHaveBeenCalledWith(sliderItem);
  });

  test("renders the placeholder component", async () => {
    render(<Item index={0} item={sliderItem} />);
    const el = await screen.findByTestId("slider-item-placeholder");
    expect(el).toBeInTheDocument();
  });

  test("does not render the placeholder component if no thumbnail exists (is this even possible?)", async () => {
    const noThumbItem = { ...sliderItem };
    delete noThumbItem.thumbnail;

    render(<Item index={0} item={noThumbItem} />);
    await waitFor(() => {
      expect(screen.queryByTestId("slider-item-placeholder")).toBeNull();
    });
  });
});
