import React, { useEffect, useRef } from "react";

/** How far, as a share of its width, a pane must be dragged to close when let go. */
const CLOSE_SHARE = 1 / 3;
/** A flick this fast toward the edge closes it however short, in pixels a millisecond. */
const FLICK = 0.5;
/** Movement before a press is read as a drag one way or the other, in pixels. */
const SLOP = 8;
const SPRING = "translate 240ms cubic-bezier(0.16, 1, 0.3, 1)";

export interface DragToCloseOptions {
  /** Whether it can be dragged now: the pane is open, and over the page. */
  enabled: boolean;
  /** The edge it slides in from, and goes back to: `"end"` (right) or `"start"`. */
  side: "start" | "end";
  onClose: () => void;
  /** The wash over the page behind it, to fade as the pane goes. */
  scrim?: React.RefObject<HTMLElement>;
  /**
   * The pane has no slide of its own (it is simply hidden): the drag finishes the motion
   * off the edge itself, then closes it. By default its own slide out carries on.
   */
  exits?: boolean;
}

/**
 * A pane that slides over the page goes back the way it came when it is dragged there,
 * as an app's drawer does: it follows the finger (or pen) toward its edge, and let go past
 * a third of its width, or flicked, it closes; short of that it springs back. A drag up or
 * down is left to scroll the pane, and a press that does not move is still a press.
 *
 * Light by design: it moves the pane by its own `translate`, set as the pointer moves,
 * never through React, so a drag renders nothing. The template's own slide (its
 * `transform`) carries on from wherever the drag let go. Mouse drags are left alone, to
 * select text as they always have.
 */
export function useDragToClose(
  pane: React.RefObject<HTMLElement>,
  { enabled, side, onClose, scrim, exits = false }: DragToCloseOptions,
) {
  const latest = useRef({ enabled, side, onClose, scrim, exits });
  latest.current = { enabled, side, onClose, scrim, exits };

  useEffect(() => {
    const element = pane.current;
    if (!element) return;
    // Opened again: whatever a drag left is cleared, so the pane slides in whole.
    element.style.translate = "";
    element.style.transition = "";
    const wash = latest.current.scrim?.current;
    if (wash) {
      wash.style.opacity = "";
      wash.style.transition = "";
    }
  }, [pane, enabled]);

  useEffect(() => {
    const element = pane.current;
    if (!element) return;
    let id: number | null = null;
    let state: "idle" | "pending" | "drag" | "scroll" = "idle";
    let startX = 0;
    let startY = 0;
    let offset = 0;
    let width = 1;
    let toward = 1;
    let samples: Array<[number, number]> = [];

    const onDown = (event: PointerEvent) => {
      if (
        event.pointerType === "mouse" ||
        !event.isPrimary ||
        !latest.current.enabled
      )
        return;
      id = event.pointerId;
      state = "pending";
      startX = event.clientX;
      startY = event.clientY;
      offset = 0;
      width = element.getBoundingClientRect().width || 1;
      const rtl = getComputedStyle(element).direction === "rtl";
      // The way it closes: toward its own edge, mirrored in a right-to-left page.
      toward = (latest.current.side === "end") !== rtl ? 1 : -1;
      samples = [[event.timeStamp, 0]];
    };

    const onMove = (event: PointerEvent) => {
      if (event.pointerId !== id || state === "idle" || state === "scroll")
        return;
      const dx = (event.clientX - startX) * toward;
      const dy = event.clientY - startY;
      if (state === "pending") {
        if (Math.abs(dy) > SLOP && Math.abs(dy) > Math.abs(dx)) {
          state = "scroll";
          return;
        }
        if (dx < SLOP) return;
        state = "drag";
        // Kept on the pane past its edge where it can be; a pointer already gone cannot be.
        try {
          element.setPointerCapture?.(event.pointerId);
        } catch {
          // The drag goes on without it.
        }
        element.style.transition = "none";
      }
      offset = Math.max(0, dx);
      element.style.translate = `${offset * toward}px 0`;
      const wash = latest.current.scrim?.current;
      if (wash) {
        wash.style.transition = "none";
        wash.style.opacity = String(1 - offset / width);
      }
      samples.push([event.timeStamp, offset]);
      if (samples.length > 5) samples.shift();
      event.preventDefault();
    };

    const onUp = (event: PointerEvent) => {
      if (event.pointerId !== id) return;
      const dragged = state === "drag";
      state = "idle";
      id = null;
      if (!dragged) return;
      // A drag is not a press: the click it ends with is swallowed.
      element.addEventListener("click", swallow, { capture: true, once: true });
      setTimeout(() => element.removeEventListener("click", swallow, true), 0);
      const [t0, x0] = samples[0];
      const [t1, x1] = samples[samples.length - 1];
      const speed = t1 > t0 ? (x1 - x0) / (t1 - t0) : 0;
      const wash = latest.current.scrim?.current;
      if (offset > width * CLOSE_SHARE || speed > FLICK) {
        if (wash) {
          wash.style.transition = "opacity 240ms ease";
          wash.style.opacity = "0";
        }
        if (latest.current.exits) {
          // No slide of its own: it goes the rest of the way, then closes.
          element.style.transition = "translate 200ms ease-out";
          element.style.translate = `${width * toward}px 0`;
          setTimeout(() => latest.current.onClose(), 200);
          return;
        }
        // Close from where it was let go: the slide out carries on from there.
        element.style.transition = "";
        latest.current.onClose();
        return;
      }
      element.style.transition = SPRING;
      element.style.translate = "";
      if (wash) {
        wash.style.transition = "opacity 240ms ease";
        wash.style.opacity = "";
      }
    };

    const swallow = (event: Event) => {
      event.stopPropagation();
      event.preventDefault();
    };

    element.addEventListener("pointerdown", onDown);
    element.addEventListener("pointermove", onMove, { passive: false });
    element.addEventListener("pointerup", onUp);
    element.addEventListener("pointercancel", onUp);
    return () => {
      element.removeEventListener("pointerdown", onDown);
      element.removeEventListener("pointermove", onMove);
      element.removeEventListener("pointerup", onUp);
      element.removeEventListener("pointercancel", onUp);
    };
  }, [pane]);
}
