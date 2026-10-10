import { useEffect, useState } from "react";

/** The Player's default (`options.player.hideDelay`). */
export const DEFAULT_HIDE_DELAY = 2000;

/** How long chrome lingers once the pointer, or keyboard focus, leaves the viewer. */
export const LEAVE_DELAY = 1000;

/**
 * Whether a viewer's chrome — its controls, navigator and the scrim behind them — is
 * showing, as the Player's control bar decides it.
 *
 * Shown on any pointer activity over `element` (a move, a press, a touch); hidden again
 * after `hideDelay` milliseconds without any, or a second after a mouse (or focus)
 * leaves. Keyboard focus inside is handled in CSS (`:has(:focus-visible)`) rather than
 * here, so a keyboard user's controls never fade while they are using them, however long
 * that takes; leaving re-shows the chrome here for the same second, so it does not
 * vanish the instant focus moves on.
 *
 * Shared by the image controls and the media transport: the same reveal, the same delay.
 */
export function useChromeVisibility(
  element: HTMLElement | null,
  hideDelay = DEFAULT_HIDE_DELAY,
): boolean {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (!element) return;
    let timer: ReturnType<typeof setTimeout> | undefined;
    /** Showing now: by pointer (here), or by keyboard focus (CSS, tracked by keys). */
    let shown = false;
    let keyboard = false;

    const set = (value: boolean) => {
      shown = value;
      setVisible(value);
    };
    const show = (event: Event) => {
      keyboard = event.type === "keydown";
      if (keyboard) return;
      set(true);
      if (timer) clearTimeout(timer);
      if (Number.isFinite(hideDelay)) {
        timer = setTimeout(() => set(false), hideDelay);
      }
    };
    const linger = () => {
      set(true);
      if (timer) clearTimeout(timer);
      timer = setTimeout(() => set(false), LEAVE_DELAY);
    };
    const leave = (event: PointerEvent) => {
      // A finger lifting off is not leaving: let the delay run out instead. (A missing
      // type is a mouse: only synthetic events omit it.)
      if (event.pointerType && event.pointerType !== "mouse") return;
      if (shown) linger();
    };
    const blur = (event: FocusEvent) => {
      // Only focus leaving the viewer altogether, not moving between its controls.
      if (element.contains(event.relatedTarget as Node | null)) return;
      // Only chrome that is showing lingers; a mouse-focused, faded viewer stays faded.
      if (shown || keyboard) linger();
    };

    element.addEventListener("pointermove", show);
    element.addEventListener("pointerdown", show);
    element.addEventListener("pointerleave", leave);
    element.addEventListener("focusout", blur);
    element.addEventListener("keydown", show);
    return () => {
      if (timer) clearTimeout(timer);
      element.removeEventListener("pointermove", show);
      element.removeEventListener("pointerdown", show);
      element.removeEventListener("pointerleave", leave);
      element.removeEventListener("focusout", blur);
      element.removeEventListener("keydown", show);
    };
  }, [element, hideDelay]);

  return visible;
}
