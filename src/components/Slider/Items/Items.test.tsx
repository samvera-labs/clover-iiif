import { beforeAll, describe, expect, it, vi } from "vitest";
import { fireEvent, render, screen } from "@testing-library/react";

import Items from "src/components/Slider/Items/Items";
import React from "react";
import { sliderItem } from "src/fixtures/slider/slider-item";

// jsdom lacks matchMedia, which Embla calls during init. Stub before the
// component (and embla-carousel-react inside it) is loaded.
beforeAll(() => {
  if (!window.matchMedia) {
    Object.defineProperty(window, "matchMedia", {
      writable: true,
      value: vi.fn().mockImplementation((query: string) => ({
        matches: false,
        media: query,
        onchange: null,
        addListener: vi.fn(),
        removeListener: vi.fn(),
        addEventListener: vi.fn(),
        removeEventListener: vi.fn(),
        dispatchEvent: vi.fn(),
      })),
    });
  }
});

// Mock LazyLoad so children are visible in tests without intersection-observer.
vi.mock("src/components/UI/LazyLoad/LazyLoad", () => ({
  __esModule: true,
  default: ({ children }: { children: React.ReactNode }) => <>{children}</>,
}));

const items = [
  { ...sliderItem, id: "https://example.org/m/1" },
  { ...sliderItem, id: "https://example.org/m/2" },
  { ...sliderItem, id: "https://example.org/m/3" },
];

describe("Slider Items (Embla carousel)", () => {
  it("renders the carousel root with the carousel role", () => {
    render(<Items items={items} instance={1} />);
    const root = screen.getByTestId("slider-items");
    expect(root).toBeInTheDocument();
    expect(root).toHaveAttribute("aria-roledescription", "carousel");
  });

  it("renders one slide per item with slide labels", () => {
    render(<Items items={items} instance={2} />);
    const slides = screen.getAllByRole("group");
    expect(slides).toHaveLength(items.length);
    expect(slides[0]).toHaveAttribute("aria-label", `1 of ${items.length}`);
    expect(slides[2]).toHaveAttribute(
      "aria-label",
      `${items.length} of ${items.length}`,
    );
  });

  it("attaches click handlers to externally-rendered prev/next buttons by instance", () => {
    const prev = document.createElement("button");
    prev.className = "clover-slider-previous-99";
    const next = document.createElement("button");
    next.className = "clover-slider-next-99";
    document.body.append(prev, next);

    render(<Items items={items} instance={99} />);

    // Clicks shouldn't throw even before Embla has measured (jsdom).
    expect(() => fireEvent.click(prev)).not.toThrow();
    expect(() => fireEvent.click(next)).not.toThrow();

    prev.remove();
    next.remove();
  });
});
