import React from "react";

interface TagProps extends React.HTMLAttributes<HTMLDivElement> {
  /** Reserves room on the left for an absolutely positioned glyph. */
  isIcon?: boolean;
}

/**
 * A small label, optionally carrying an icon.
 *
 * The background and foreground colours Stitches carried here — `$lightGrey` and
 * `$richBlack50` — are gone rather than translated. Neither token exists in the theme, so both
 * declarations resolved to nothing and were dropped by the browser; every place that shows a
 * `Tag` sets its own colours anyway.
 */
const Tag: React.FC<TagProps> = ({
  children,
  className,
  isIcon = false,
  ...attributes
}) => (
  <div
    {...attributes}
    className={["clover-tag", className].filter(Boolean).join(" ")}
    data-has-icon={isIcon || undefined}
  >
    {children}
  </div>
);

export { Tag };
