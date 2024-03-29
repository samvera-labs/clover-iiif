import { useEffect, useState } from "react";

interface Position {
  top: number;
  left: number;
}

/**
 * Hook that returns an element's distance from the top of the visible window.
 */
export const useDistanceFromViewportTop = (
  ref: React.RefObject<HTMLElement>,
): Position => {
  const [position, setPosition] = useState<Position>({ top: 0, left: 0 });

  useEffect(() => {
    const handleUpdatePosition = () => {
      if (ref.current) {
        const rect = ref.current.getBoundingClientRect();
        setPosition({
          top: rect.top,
          left: rect.left,
        });
      }
    };

    // Update position for both scroll and resize events
    window.addEventListener("scroll", handleUpdatePosition);
    window.addEventListener("resize", handleUpdatePosition);
    handleUpdatePosition(); // Call once to set the initial value.

    return () => {
      window.removeEventListener("scroll", handleUpdatePosition);
      window.removeEventListener("resize", handleUpdatePosition);
    };
  }, [ref]);

  return position;
};
