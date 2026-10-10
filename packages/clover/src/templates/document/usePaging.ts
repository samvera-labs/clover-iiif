import { useEffect, useRef } from "react";

export interface Pager {
  hasNext: boolean;
  hasPrevious: boolean;
  next: () => void;
  previous: () => void;
}

/** Wheel travel, in pixels, that turns a page. */
const STEP = 60;
/** A pause this long between wheel events ends a gesture. */
const QUIET_MS = 160;
/** Past this, a strong wheel event is a new turn even without a pause: a wheel spun on. */
const REPEAT_MS = 600;

/**
 * Turn pages from the wheel, the trackpad and the keyboard, a whole page at a time: one
 * gesture is one page, however long its momentum runs. A gesture begins after a pause,
 * or when the wheel swings harder than the momentum it interrupts.
 *
 * At the first or last page the wheel is let through, so the document scrolls on past
 * the reader. Ctrl- or ⌘-wheel (a pinch, or the browser's zoom) is left alone.
 */
export function usePaging(
  target: React.RefObject<HTMLElement>,
  pager: Pager,
): void {
  const latest = useRef(pager);
  latest.current = pager;

  useEffect(() => {
    const element = target.current;
    if (!element) return;
    let travel = 0;
    let turned = false;
    let lastAt = -Infinity;
    let turnedAt = -Infinity;
    let lastSize = 0;

    const onWheel = (event: WheelEvent) => {
      if (event.ctrlKey || event.metaKey) return;
      const scale =
        event.deltaMode === 1
          ? 16
          : event.deltaMode === 2
            ? element.clientHeight
            : 1;
      const delta = event.deltaY * scale;
      if (Math.abs(delta) < Math.abs(event.deltaX * scale)) return;
      const { hasNext, hasPrevious, next, previous } = latest.current;
      if (delta > 0 ? !hasNext : !hasPrevious) {
        travel = 0;
        return;
      }
      event.preventDefault();

      const now = event.timeStamp;
      const size = Math.abs(delta);
      const fresh =
        now - lastAt > QUIET_MS ||
        (size > lastSize * 2 && size > 20) ||
        (now - turnedAt > REPEAT_MS && size >= 40);
      if (fresh) {
        turned = false;
        travel = 0;
      }
      lastAt = now;
      lastSize = size;
      if (turned) return;

      if (Math.sign(delta) !== Math.sign(travel)) travel = 0;
      travel += delta;
      if (Math.abs(travel) < STEP) return;
      turned = true;
      turnedAt = now;
      travel = 0;
      if (delta > 0) next();
      else previous();
    };

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.defaultPrevented || event.altKey || event.ctrlKey) return;
      const tag = (event.target as HTMLElement | null)?.tagName;
      if (tag === "INPUT" || tag === "SELECT" || tag === "TEXTAREA") return;
      const { hasNext, hasPrevious, next, previous } = latest.current;
      if (event.key === "PageDown" && hasNext) next();
      else if (event.key === "PageUp" && hasPrevious) previous();
      else return;
      event.preventDefault();
    };

    element.addEventListener("wheel", onWheel, { passive: false });
    element.addEventListener("keydown", onKeyDown);
    return () => {
      element.removeEventListener("wheel", onWheel);
      element.removeEventListener("keydown", onKeyDown);
    };
  }, [target]);
}
