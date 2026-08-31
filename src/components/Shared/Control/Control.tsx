import React from "react";

import { join } from "src/lib/classnames";

/**
 * The one carousel control. Styles live in `Control.css`, keyed on `.clover-control`.
 *
 * `forwardRef` is load-bearing rather than boilerplate: the Viewer's content search
 * renders this under a Radix `Form.Submit asChild`, which clones the child and hands it a
 * ref. Stitches forwarded refs for free; a plain function component has to say so, and
 * without it Radix cannot register the control.
 */
const Control = React.forwardRef<
  HTMLButtonElement,
  React.ComponentPropsWithoutRef<"button">
>(({ className, ...rest }, ref) => (
  <button {...rest} className={join("clover-control", className)} ref={ref} />
));

Control.displayName = "Control";

export { Control };
