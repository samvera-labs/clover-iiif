import React from "react";
import { Reference } from "@iiif/presentation-3";
import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import ScrollItems from "./Items";
import { ScrollContext, initialState } from "src/context/scroll-context";

vi.mock("src/components/UI/LazyLoad/LazyLoad", () => ({
  __esModule: true,
  default: ({ children }) => <>{children}</>,
}));

vi.mock("src/components/Scroll/Items/Item", () => ({
  __esModule: true,
  default: () => <div data-testid="scroll-item" />,
}));

const canvasReference = {
  id: "https://example.org/canvas/1",
  type: "Canvas",
} as Reference<"Canvas">;

const renderWithContext = (stateOverrides = {}) => {
  return render(
    <ScrollContext.Provider
      value={{
        state: {
          ...initialState,
          ...stateOverrides,
        },
        dispatch: vi.fn(),
      }}
    >
      <ScrollItems items={[canvasReference]} />
    </ScrollContext.Provider>,
  );
};

describe("ScrollItems", () => {
  it("does not render until annotations are resolved", () => {
    const { container } = renderWithContext({
      annotations: undefined,
      annotationsLoading: true,
    });

    expect(container.firstChild).toBeNull();
  });

  it("renders list items when annotations are ready", () => {
    renderWithContext({ annotations: [], annotationsLoading: false });

    expect(screen.getAllByTestId("scroll-item")).toHaveLength(1);
  });
});
