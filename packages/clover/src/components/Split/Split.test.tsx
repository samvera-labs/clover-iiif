import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import React from "react";

import { initCloverI18n } from "../../i18n";
import { Split, SplitHandle, SplitPane, toPixels } from "./Split";

/*
 * jsdom lays nothing out: a 1000px split, and each pane as wide as its size says (its
 * `--clover-split-size` in px, or 384 for the 24rem it starts at).
 */
beforeEach(() => {
  initCloverI18n({ lng: "en" });
  vi.spyOn(HTMLElement.prototype, "clientWidth", "get").mockReturnValue(1000);
  vi.spyOn(HTMLElement.prototype, "getBoundingClientRect").mockImplementation(
    function (this: HTMLElement) {
      const size = this.style.getPropertyValue("--clover-split-size");
      const width = size.endsWith("px") ? parseFloat(size) : 384;
      return { left: 0, right: width, width, top: 0, bottom: 0 } as DOMRect;
    },
  );
  localStorage.clear();
});
afterEach(() => vi.restoreAllMocks());

function Layout({ storageKey }: { storageKey?: string }) {
  return (
    <Split storageKey={storageKey}>
      <SplitPane min="16rem">Stage</SplitPane>
      <SplitHandle />
      <SplitPane name="panel" size="24rem" min="14rem" data-testid="panel">
        Panel
      </SplitPane>
    </Split>
  );
}

const size = () =>
  screen.getByTestId("panel").style.getPropertyValue("--clover-split-size");

describe("Split", () => {
  it("holds each pane's minimum in the layout, not only under a handle", () => {
    render(
      <Split>
        <SplitPane min="16rem">Stage</SplitPane>
        <SplitHandle />
        <SplitPane size="24rem" min="14rem">
          Panel
        </SplitPane>
        <SplitPane>Rest</SplitPane>
      </Split>,
    );
    // The sized pane gives way, down to its minimum, before the other does.
    expect(screen.getByText("Stage").style.minWidth).toBe("16rem");
    expect(screen.getByText("Panel").style.minWidth).toBe("14rem");
    // Without one it can still shrink past its content.
    expect(parseFloat(screen.getByText("Rest").style.minWidth)).toBe(0);
  });

  it("lays panes side by side, the sized one at its size, and names its bar", () => {
    render(<Layout />);
    const split = document.querySelector(".clover-split") as HTMLElement;
    expect(split.style.display).toBe("flex");
    expect(size()).toBe("24rem");
    const handle = screen.getByRole("separator", { name: "Resize panels" });
    expect(handle).toHaveAttribute("aria-orientation", "vertical");
    expect(handle).toHaveAttribute("tabindex", "0");
  });

  it("moves by keyboard, toward the sized pane to shrink it, within its limits", async () => {
    render(<Layout />);
    const handle = screen.getByRole("separator");
    // The panel is after the bar: Left widens it, by 1rem; Shift moves 4rem.
    fireEvent.keyDown(handle, { key: "ArrowLeft" });
    expect(size()).toBe("400px");
    fireEvent.keyDown(handle, { key: "ArrowRight", shiftKey: true });
    expect(size()).toBe("336px");
    // Home is its own minimum; End leaves the stage its minimum (1000 − 16rem).
    fireEvent.keyDown(handle, { key: "Home" });
    expect(size()).toBe("224px");
    fireEvent.keyDown(handle, { key: "End" });
    expect(size()).toBe("744px");
    await waitFor(() => expect(handle).toHaveAttribute("aria-valuenow", "74"));
    expect(handle).toHaveAttribute("aria-valuemin", "22");
    expect(handle).toHaveAttribute("aria-valuemax", "74");
  });

  it("goes back to the pane's own size on a double click", () => {
    render(<Layout />);
    const handle = screen.getByRole("separator");
    fireEvent.keyDown(handle, { key: "Home" });
    expect(size()).toBe("224px");
    fireEvent.doubleClick(handle);
    expect(size()).toBe("24rem");
  });

  it("remembers the size under its storage key, for the same layout next time", async () => {
    const { unmount } = render(<Layout storageKey="test-split" />);
    fireEvent.keyDown(screen.getByRole("separator"), { key: "Home" });
    expect(JSON.parse(localStorage.getItem("test-split")!)).toEqual({
      panel: 224,
    });
    unmount();
    render(<Layout storageKey="test-split" />);
    await waitFor(() => expect(size()).toBe("224px"));
  });

  it("reads lengths in px, rem and percent of the split", () => {
    expect(toPixels(320, 1000)).toBe(320);
    expect(toPixels("20px", 1000)).toBe(20);
    expect(toPixels("2rem", 1000)).toBe(32);
    expect(toPixels("25%", 1000)).toBe(250);
    expect(toPixels(undefined, 1000)).toBeUndefined();
  });
});
