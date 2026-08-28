import { getFullscreenElement } from "src/lib/fullscreen";
import { useEffect, useState } from "react";

/**
 * Whether `element` sits inside whatever is currently full screen.
 *
 * Containment, not identity — which is the difference from `useFullscreen`. A control deep
 * inside the tree needs to know that *something above it* is full screen, and it cannot know
 * which root that is: in a `Viewer` the full-screen element is the viewer, while a standalone
 * `Image` full-screens its own wrapper. Asking whether the full-screen element contains this
 * one answers both without the control being told where it lives.
 *
 * `useFullscreen` deliberately keeps the stricter test, because the exit control uses it to
 * decide which single root offers the way out.
 */
export default function useWithinFullscreen(
  element: HTMLElement | null,
): boolean {
  const [isWithin, setIsWithin] = useState(false);

  useEffect(() => {
    if (!element) return;

    const sync = () =>
      setIsWithin(Boolean(getFullscreenElement()?.contains(element)));
    sync();

    document.addEventListener("fullscreenchange", sync);
    document.addEventListener("webkitfullscreenchange", sync);

    return () => {
      document.removeEventListener("fullscreenchange", sync);
      document.removeEventListener("webkitfullscreenchange", sync);
    };
  }, [element]);

  return isWithin;
}
