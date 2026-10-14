import { useEffect, useRef } from "react";

export interface Pager {
  hasNext: boolean;
  hasPrevious: boolean;
  next: () => void;
  previous: () => void;
}

/** Wheel travel, in pixels, that turns a page: a deliberate scroll, not a brush. */
const STEP = 100;
/** A pause this long between wheel events ends a gesture. */
const QUIET_MS = 160;
/**
 * Once a gesture has turned a page, a wheel still spun this long after, at full strength,
 * turns another: a mouse wheel spun on, a page a second. Momentum, which only fades,
 * never does.
 */
const REPEAT_MS = 1000;

/**
 * How far a gesture has pulled toward a turn: from -1 (all the way to the previous page)
 * through 0 to 1 (the next), and how it ended. `"pull"` while it builds; `"turn"` when it
 * turned the page (the pull then whole, 1 or -1); `"release"` when the reader let go
 * before it did.
 */
export type PullListener = (
  pull: number,
  phase: "pull" | "turn" | "release",
) => void;

/**
 * Turn pages from the wheel, the trackpad and the keyboard, a whole page at a time: one
 * gesture is one page, however long its momentum runs. A gesture begins after a pause,
 * or when the wheel swings harder than the momentum it interrupts.
 *
 * At the first or last page the wheel is let through, so the document scrolls on past
 * the reader. Ctrl- or ⌘-wheel (a pinch, or the browser's zoom) is left alone.
 *
 * `onPull` hears the gesture's pull as it builds toward a turn, so the page can show
 * that a little more will turn it.
 */
export function usePaging(
  target: React.RefObject<HTMLElement>,
  pager: Pager,
  onPull?: PullListener,
): void {
  const latest = useRef(pager);
  latest.current = pager;
  const pullTo = useRef(onPull);
  pullTo.current = onPull;

  useEffect(() => {
    const element = target.current;
    if (!element) return;
    let travel = 0;
    let turned = false;
    let lastAt = -Infinity;
    let turnedAt = -Infinity;
    let lastSize = 0;
    let released: ReturnType<typeof setTimeout> | undefined;

    // A gesture that pulled but did not turn lets go once the wheel goes quiet.
    const releaseLater = () => {
      clearTimeout(released);
      released = setTimeout(() => {
        if (travel === 0) return;
        travel = 0;
        pullTo.current?.(0, "release");
      }, QUIET_MS);
    };

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
        if (travel !== 0) pullTo.current?.(0, "release");
        travel = 0;
        return;
      }
      event.preventDefault();

      const now = event.timeStamp;
      const size = Math.abs(delta);
      /*
       * A pause always begins a new gesture. Once this one has turned a page, its
       * momentum is let run out: only a swing far harder than it, or a wheel still spun
       * at full strength a second on, turns another. Before it has turned, every event
       * adds to the same pull.
       */
      const swing = turned && size > lastSize * 2.5 && size > 40;
      const spun =
        turned && now - turnedAt > REPEAT_MS && size >= 40 && size >= lastSize;
      const fresh = now - lastAt > QUIET_MS || swing || spun;
      if (fresh) {
        turned = false;
        travel = 0;
      }
      lastAt = now;
      lastSize = size;
      if (turned) return;

      if (Math.sign(delta) !== Math.sign(travel)) travel = 0;
      travel += delta;
      if (Math.abs(travel) < STEP) {
        pullTo.current?.(travel / STEP, "pull");
        releaseLater();
        return;
      }
      turned = true;
      turnedAt = now;
      travel = 0;
      clearTimeout(released);
      pullTo.current?.(delta > 0 ? 1 : -1, "turn");
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
      clearTimeout(released);
      element.removeEventListener("wheel", onWheel);
      element.removeEventListener("keydown", onKeyDown);
    };
  }, [target]);
}
