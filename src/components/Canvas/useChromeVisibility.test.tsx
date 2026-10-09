import { act, render } from "@testing-library/react";
import React, { useState } from "react";

import {
  DEFAULT_HIDE_DELAY,
  LEAVE_DELAY,
  useChromeVisibility,
} from "src/components/Canvas/useChromeVisibility";

function Probe() {
  const [element, setElement] = useState<HTMLDivElement | null>(null);
  const visible = useChromeVisibility(element);
  return (
    <div data-testid="probe" data-visible={visible} ref={setElement}>
      <button type="button">Inside</button>
    </div>
  );
}

const mouse = (type: string) =>
  Object.assign(new MouseEvent(type), { pointerType: "mouse" });

beforeEach(() => vi.useFakeTimers());
afterEach(() => vi.useRealTimers());

describe("useChromeVisibility", () => {
  it("shows on pointer activity and fades after the hide delay", () => {
    const { getByTestId } = render(<Probe />);
    const probe = getByTestId("probe");
    act(() => void probe.dispatchEvent(mouse("pointermove")));
    expect(probe).toHaveAttribute("data-visible", "true");
    act(() => void vi.advanceTimersByTime(DEFAULT_HIDE_DELAY));
    expect(probe).toHaveAttribute("data-visible", "false");
  });

  it("waits a second after the pointer leaves before fading", () => {
    const { getByTestId } = render(<Probe />);
    const probe = getByTestId("probe");
    act(() => void probe.dispatchEvent(mouse("pointermove")));
    act(() => void probe.dispatchEvent(mouse("pointerleave")));
    act(() => void vi.advanceTimersByTime(LEAVE_DELAY - 1));
    expect(probe).toHaveAttribute("data-visible", "true");
    act(() => void vi.advanceTimersByTime(1));
    expect(probe).toHaveAttribute("data-visible", "false");
  });

  it("waits a second after keyboard focus leaves before fading", () => {
    const { getByTestId, getByRole } = render(<Probe />);
    const probe = getByTestId("probe");
    const inside = getByRole("button");
    inside.focus();
    act(
      () =>
        void inside.dispatchEvent(
          new KeyboardEvent("keydown", { bubbles: true }),
        ),
    );
    act(() => inside.blur());
    expect(probe).toHaveAttribute("data-visible", "true");
    act(() => void vi.advanceTimersByTime(LEAVE_DELAY));
    expect(probe).toHaveAttribute("data-visible", "false");
  });

  it("does not flash faded chrome back when a mouse-focused viewer blurs", () => {
    const { getByTestId, getByRole } = render(<Probe />);
    const probe = getByTestId("probe");
    const inside = getByRole("button");
    inside.focus();
    act(() => inside.blur());
    expect(probe).toHaveAttribute("data-visible", "false");
  });
});
