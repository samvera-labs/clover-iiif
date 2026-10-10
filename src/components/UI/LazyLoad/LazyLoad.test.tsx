import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";

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
    // `restoreAllMocks` leaves `stubGlobal` in place; without this the stub leaks into
    // later tests in the same worker.
    vi.unstubAllGlobals();
  });

  it("renders children once visible", async () => {
    render(
      <LazyLoad>
        <div>Lazy Content</div>
      </LazyLoad>,
    );

    /*
     * Wait for the content rather than for a fixed time. The observer fires from a timer,
     * and React applies the state it sets on its own schedule; under a loaded test run a
     * 10 ms wait sometimes ended before the render did.
     */
    expect(await screen.findByText("Lazy Content")).toBeInTheDocument();
    expect(observeMock).toHaveBeenCalled();
    expect(disconnectMock).toHaveBeenCalled();
  });
});
