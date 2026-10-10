import { fireEvent, render } from "@testing-library/react";
import React, { useRef } from "react";

import { type Pager, usePaging } from "./usePaging";

function Stage(pager: Pager) {
  const ref = useRef<HTMLDivElement>(null);
  usePaging(ref, pager);
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

function setup(overrides: Partial<Pager> = {}) {
  const pager = {
    hasNext: true,
    hasPrevious: true,
    next: vi.fn(),
    previous: vi.fn(),
    ...overrides,
  };
  const { getByTestId } = render(<Stage {...pager} />);
  return { pager, stage: getByTestId("stage") };
}

describe("usePaging", () => {
  it("turns one page per gesture, however long its momentum runs", async () => {
    const { pager, stage } = setup();
    for (const delta of [30, 40, 35, 25, 18, 12, 8, 5, 3]) wheel(stage, delta);
    expect(pager.next).toHaveBeenCalledTimes(1);

    await pause(200);
    wheel(stage, -80);
    expect(pager.previous).toHaveBeenCalledTimes(1);
  });

  it("starts a new turn when the wheel swings harder than the momentum", () => {
    const { pager, stage } = setup();
    for (const delta of [70, 30, 15, 8]) wheel(stage, delta);
    wheel(stage, 90);
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
