import { render, screen, waitFor } from "@testing-library/react";

import PaintingPlaceholder from "./Placeholder";
import React from "react";

const props = {
  isActive: true,
  isMedia: false,
  items: [],
  setIsInteractive: vi.fn(),
};

const items = [
  {
    id: "https://example.com/iiif/example-a",
    label: {
      en: ["Example A"],
    },
    width: 640,
    height: 640,
  },
  {
    id: "https://example.com/iiif/example-b",
    label: {
      en: ["Example B"],
    },
    width: 800,
    height: 600,
  },
];

// Mocks must be defined before import if hoisted
vi.mock("src/hooks/use-iiif", () => ({
  getLabel: vi.fn((label) => label.en[0]),
  getPaintingResource: vi.fn((vault, id) =>
    items.filter((item) => item.id === id),
  ),
}));

describe("PaintingPlaceholder", () => {
  test("renders a placeholder with a single image", async () => {
    render(<PaintingPlaceholder {...props} items={[items[0]]} />);

    const placeholder = screen.getByRole("button");
    expect(placeholder).toBeInTheDocument();
    expect(placeholder).toHaveAttribute("data-active", "true");
    expect(placeholder).toHaveAttribute("data-paged", "false");

    await waitFor(() => {
      expect(screen.getAllByRole("img")).toHaveLength(1);
    });

    const img = screen.getAllByRole("img");
    expect(img[0]).toHaveAttribute("src", "https://example.com/iiif/example-a");
    expect(img[0]).toHaveAttribute("alt", "Example A");
    expect(img[0]).toHaveAttribute("width", "640");
    expect(img[0]).toHaveAttribute("height", "640");

    placeholder.click();
    expect(props.setIsInteractive).toHaveBeenCalledWith(true);
  });

  test("renders a placeholder with multiple images", async () => {
    render(<PaintingPlaceholder {...props} items={items} />);

    const placeholder = screen.getByRole("button");
    expect(placeholder).toBeInTheDocument();
    expect(placeholder).toHaveAttribute("data-active", "true");
    expect(placeholder).toHaveAttribute("data-paged", "true");

    await waitFor(() => {
      expect(screen.getAllByRole("img")).toHaveLength(2);
    });

    const img = screen.getAllByRole("img");
    expect(img[0]).toHaveAttribute("src", "https://example.com/iiif/example-a");
    expect(img[0]).toHaveAttribute("alt", "Example A");
    expect(img[0]).toHaveAttribute("width", "640");
    expect(img[0]).toHaveAttribute("height", "640");

    // get calculated width as percentage
    const imgStyle0 = window.getComputedStyle(img[0]);
    const imgWidth0 = parseFloat(imgStyle0.width).toPrecision(4);
    expect(imgWidth0).toBe("42.86");

    expect(img[1]).toHaveAttribute("src", "https://example.com/iiif/example-b");
    expect(img[1]).toHaveAttribute("alt", "Example B");
    expect(img[1]).toHaveAttribute("width", "800");
    expect(img[1]).toHaveAttribute("height", "600");

    // get calculated width as percentage
    const imgStyle1 = window.getComputedStyle(img[1]);
    const imgWidth1 = parseFloat(imgStyle1.width).toPrecision(4);
    expect(imgWidth1).toBe("57.14");
  });

  test("renders an empty component if not active", async () => {
    render(
      <PaintingPlaceholder {...props} items={[items[0]]} isActive={false} />,
    );

    const placeholder = screen.queryByRole("button");
    expect(placeholder).not.toBeInTheDocument();
  });
});
