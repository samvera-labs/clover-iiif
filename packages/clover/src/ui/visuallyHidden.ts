import type { CSSProperties } from "react";

/**
 * Hidden from sight, present for assistive technology. Inline, not a class: it has to
 * hold without the stylesheet, or the text it hides would show.
 */
export const visuallyHidden: CSSProperties = {
  position: "absolute",
  width: 1,
  height: 1,
  margin: -1,
  padding: 0,
  overflow: "hidden",
  clip: "rect(0 0 0 0)",
  whiteSpace: "nowrap",
  border: 0,
};
