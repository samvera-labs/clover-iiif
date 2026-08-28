import { getFullscreenElement } from "src/lib/fullscreen";
import { useEffect, useState } from "react";

/**
 * Whether `element` is the one currently full screen.
 *
 * Driven by the browser's own `fullscreenchange`, so it is right however full screen was
 * entered or left — the button, `Escape`, the window controls, or another element taking over.
 *
 * The result is published as a `data-` attribute rather than left to the `:fullscreen`
 * pseudo-class. Both would be accurate, but an attribute can be asserted on: `:fullscreen`
 * cannot be forced, so a layout keyed only to it can only ever be checked by eye, and not at
 * all in an embedded browser that declines the request.
 */
export default function useFullscreen(element: HTMLElement | null): boolean {
  const [isFullscreen, setIsFullscreen] = useState(false);

  useEffect(() => {
    if (!element) return;

    const sync = () => setIsFullscreen(getFullscreenElement() === element);
    sync();

    // The prefixed event is Safari's; both are harmless to listen for.
    document.addEventListener("fullscreenchange", sync);
    document.addEventListener("webkitfullscreenchange", sync);

    return () => {
      document.removeEventListener("fullscreenchange", sync);
      document.removeEventListener("webkitfullscreenchange", sync);
    };
  }, [element]);

  return isFullscreen;
}
