import React from "react";

import { join } from "src/lib/classnames";

/**
 * The one search field. Styles live in `Search.css`, keyed on `.clover-search-input`.
 *
 * `forwardRef` for the same reason as `Control`: the Viewer's content search puts this
 * inside a Radix `Form.Control asChild`, which needs the ref to register the field.
 */
const SearchInput = React.forwardRef<
  HTMLInputElement,
  React.ComponentPropsWithoutRef<"input">
>(({ className, ...rest }, ref) => (
  <input
    {...rest}
    className={join("clover-search-input", className)}
    ref={ref}
  />
));

SearchInput.displayName = "SearchInput";

export { SearchInput };
