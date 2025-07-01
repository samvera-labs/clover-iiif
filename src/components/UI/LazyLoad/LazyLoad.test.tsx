import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { act, render, screen } from "@testing-library/react";

import LazyLoad from "./LazyLoad"; // adjust path as needed
import React from "react";

describe("LazyLoad", () => {
  let observeMock: ReturnType<typeof vi.fn>;
  let disconnectMock: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    observeMock = vi.fn();
    disconnectMock = vi.fn();

    // Mock IntersectionObserver globally
    vi.stubGlobal(
      "IntersectionObserver",
      vi.fn(function (this: any, callback) {
        this.observe = observeMock;
        this.disconnect = disconnectMock;
        // Simulate element entering viewport immediately
        setTimeout(() => {
          callback([{ isIntersecting: true }]);
        }, 0);
      }),
    );
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("renders children once visible", async () => {
    await act(async () => {
      render(
        <LazyLoad>
          <div>
            <div>Lazy Content</div>
          </div>
        </LazyLoad>,
      );
    });

    // Wait for the next tick so the setTimeout and callback can run
    await new Promise((resolve) => setTimeout(resolve, 10));

    expect(screen.getByText("Lazy Content")).toBeInTheDocument();
    expect(observeMock).toHaveBeenCalled();
    expect(disconnectMock).toHaveBeenCalled();
  });
});
