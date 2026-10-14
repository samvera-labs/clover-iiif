import { fireEvent, render } from "@testing-library/react";
import React, { useRef } from "react";

import { type Pager, type PullListener, usePaging } from "./usePaging";

function Stage({ onPull, ...pager }: Pager & { onPull?: PullListener }) {
  const ref = useRef<HTMLDivElement>(null);
  usePaging(ref, pager, onPull);
  return <div ref={ref} data-testid="stage" tabIndex={0} />;
}

const wheel = (element: Element, deltaY: number, init: WheelEventInit = {}) => {
  const event = new WheelEvent("wheel", {
    deltaY,
    bubbles: true,
    cancelable: true,
    ...init,
  });
  element.dispatchEvent(event);
  return event;
};

const pause = (ms: number) => new Promise((done) => setTimeout(done, ms));

function setup(overrides: Partial<Pager> = {}, onPull?: PullListener) {
  const pager = {
    hasNext: true,
    hasPrevious: true,
    next: vi.fn(),
    previous: vi.fn(),
    ...overrides,
  };
  const { getByTestId } = render(<Stage {...pager} onPull={onPull} />);
  return { pager, stage: getByTestId("stage") };
}

describe("usePaging", () => {
  it("turns one page per gesture, however long its momentum runs", async () => {
    const { pager, stage } = setup();
    for (const delta of [30, 40, 35, 25, 18, 12, 8, 5, 3]) wheel(stage, delta);
    expect(pager.next).toHaveBeenCalledTimes(1);

    await pause(200);
    wheel(stage, -100);
    expect(pager.previous).toHaveBeenCalledTimes(1);
  });

  it("never skips a page on a long swipe's momentum, however strong it stays", async () => {
    const { pager, stage } = setup();
    wheel(stage, 110);
    // A fast swipe's momentum, still strong a second on but only ever fading.
    for (const delta of [100, 92, 85, 78, 70, 63, 56, 50, 45, 41]) {
      await pause(120);
      wheel(stage, delta);
    }
    expect(pager.next).toHaveBeenCalledTimes(1);
  });

  it("reports the pull as it builds, then the turn, or the release when let go", async () => {
    const onPull = vi.fn();
    const { pager, stage } = setup({}, onPull);
    wheel(stage, 20);
    expect(onPull).toHaveBeenLastCalledWith(0.2, "pull");
    wheel(stage, 20);
    expect(onPull).toHaveBeenLastCalledWith(0.4, "pull");
    // Let go short of a turn: it springs back.
    await pause(200);
    expect(onPull).toHaveBeenLastCalledWith(0, "release");
    expect(pager.next).not.toHaveBeenCalled();
    // Toward the previous page, the pull is negative; enough of it turns.
    wheel(stage, -30);
    expect(onPull).toHaveBeenLastCalledWith(-0.3, "pull");
    wheel(stage, -35);
    wheel(stage, -40);
    // Turned, the pull is whole, toward the page it turned to.
    expect(onPull).toHaveBeenLastCalledWith(-1, "turn");
    expect(pager.previous).toHaveBeenCalledTimes(1);
  });

  it("starts a new turn when the wheel swings harder than the momentum", () => {
    const { pager, stage } = setup();
    for (const delta of [110, 30, 15, 8]) wheel(stage, delta);
    wheel(stage, 120);
    expect(pager.next).toHaveBeenCalledTimes(2);
  });

  it("holds the page from scrolling, except past the first or last page", () => {
    const { stage } = setup({ hasNext: false });
    expect(wheel(stage, 100).defaultPrevented).toBe(false);
    expect(wheel(stage, -100).defaultPrevented).toBe(true);
  });

  it("leaves a pinch (ctrl-wheel) and sideways scrolling alone", () => {
    const { pager, stage } = setup();
    expect(wheel(stage, 100, { ctrlKey: true }).defaultPrevented).toBe(false);
    expect(wheel(stage, 10, { deltaX: 100 }).defaultPrevented).toBe(false);
    expect(pager.next).not.toHaveBeenCalled();
  });

  it("turns with PageDown and PageUp", () => {
    const { pager, stage } = setup();
    fireEvent.keyDown(stage, { key: "PageDown" });
    fireEvent.keyDown(stage, { key: "PageUp" });
    expect(pager.next).toHaveBeenCalledTimes(1);
    expect(pager.previous).toHaveBeenCalledTimes(1);
  });
});
