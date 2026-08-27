import { describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";

import { type CollectionItems } from "@iiif/presentation-3";
import Items from "src/components/Slider/Items/Items";
import React from "react";
import { type BreakpointConfig } from "src/components/Slider/useBreakpoints";
import { type UseTrackApi } from "src/components/Shared/Track/useTrack";
import { sliderItem } from "src/fixtures/slider/slider-item";

// Mock LazyLoad so children are visible in tests without intersection-observer.
vi.mock("src/components/UI/LazyLoad/LazyLoad", () => ({
  __esModule: true,
  default: ({ children }: { children: React.ReactNode }) => <>{children}</>,
}));

/*
 * The fixture is a hand-written Manifest shape, which does not structurally satisfy
 * `CollectionItems`. Casting once here keeps the assertion at the call sites rather than
 * repeating it on every render.
 */
const items = [
  { ...sliderItem, id: "https://example.org/m/1" },
  { ...sliderItem, id: "https://example.org/m/2" },
  { ...sliderItem, id: "https://example.org/m/3" },
] as unknown as CollectionItems[];

/** `Items` takes slides, so an `individuals` sequence is one item each. */
const slides = items.map((item) => [item]);

const config: BreakpointConfig = {
  spaceBetween: "1rem",
};

/**
 * `Items` only consumes the track's ref. The scroll functions are exercised where they
 * are wired up — see Header.test.tsx — and the measuring itself needs real layout, which
 * jsdom does not provide.
 */
const trackStub = (): UseTrackApi => ({
  // Embla hands back a callback ref, so the stub is a no-op function rather than an object.
  ref: () => {},
  canScrollPrev: false,
  canScrollNext: true,
  scrollPrev: vi.fn(),
  scrollNext: vi.fn(),
  scrollToIndex: vi.fn(),
  measure: vi.fn(),
});

describe("Slider Items", () => {
  it("renders the carousel root with the carousel role", () => {
    render(<Items slides={slides} config={config} track={trackStub()} />);
    const root = screen.getByTestId("slider-items");
    expect(root).toBeInTheDocument();
    expect(root).toHaveAttribute("aria-roledescription", "carousel");
  });

  it("renders one slide per item with slide labels", () => {
    render(<Items slides={slides} config={config} track={trackStub()} />);
    const rendered = screen.getAllByRole("group");
    expect(rendered).toHaveLength(items.length);
    expect(rendered[0]).toHaveAttribute("aria-label", `1 of ${items.length}`);
    expect(rendered[2]).toHaveAttribute(
      "aria-label",
      `${items.length} of ${items.length}`,
    );
  });

  it("marks each slide with the index the track measures against", () => {
    render(<Items slides={slides} config={config} track={trackStub()} />);
    const rendered = screen.getAllByRole("group");
    rendered.forEach((slide, index) =>
      expect(slide).toHaveAttribute("data-track-index", String(index)),
    );
  });

  it("sizes slides from the resolved breakpoint", () => {
    render(<Items slides={slides} config={config} track={trackStub()} />);
    // Embla translates an inner track inside the viewport, so the gap lives there.
    const track = screen
      .getByTestId("slider-items")
      .querySelector<HTMLElement>(".clover-slider-track");
    expect(track).toHaveStyle({ gap: "1rem" });
  });

  it("lays a paged spread out as one slide holding two items", () => {
    render(
      <Items
        slides={[[items[0]], [items[1], items[2]]]}
        config={config}
        track={trackStub()}
      />,
    );
    const rendered = screen.getAllByRole("group");
    expect(rendered).toHaveLength(2);
    expect(rendered[0]).toHaveAttribute("data-slide-items", "1");
    expect(rendered[1]).toHaveAttribute("data-slide-items", "2");
    // Both pages of the spread render inside the single slide.
    expect(
      rendered[1].querySelectorAll('[data-testid="slider-item"]'),
    ).toHaveLength(2);
  });
});
