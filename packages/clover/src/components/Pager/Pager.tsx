import React, { forwardRef } from "react";

import type { ViewingDirection } from "../../core/sequence";
import { useCloverTranslation } from "../../i18n/useCloverTranslation";
import { join } from "../../lib/classnames";
import { useNavigation, useSequence } from "../../react/hooks";
import { Tip } from "../../ui/Tip";
import { visuallyHidden } from "../../ui/visuallyHidden";

/**
 * Moving between views: `Previous`, `Next` and `Position`, or all three as `Pager`.
 *
 * They step by view, so a paged book moves a spread at a time. The arrows follow the
 * Manifest's `viewingDirection`: in a right-to-left book, "previous" points right. Each
 * part renders nothing when there is only one view to show.
 *
 * `Previous` and `Next` are round controls with an arrow, as Items' own arrows are: the
 * name is hidden from sight but not from assistive technology, and shows on hover and
 * focus. Each is hidden where there is nowhere to go.
 */

type ButtonProps = Omit<
  React.ButtonHTMLAttributes<HTMLButtonElement>,
  "type" | "children"
>;

/** Degrees to turn a right-pointing chevron, for "next" in each direction. */
const NEXT_ROTATION: Record<ViewingDirection, number> = {
  "left-to-right": 0,
  "right-to-left": 180,
  "top-to-bottom": 90,
  "bottom-to-top": 270,
};

/** A chevron with its own size, so it never fills its button without the stylesheet. */
function Chevron({ rotate }: { rotate: number }) {
  return (
    <svg
      aria-hidden="true"
      focusable="false"
      width="16"
      height="16"
      viewBox="0 0 16 16"
      className="clover-pager-icon"
    >
      <path
        d="M6 3l5 5-5 5"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        transform={`rotate(${rotate} 8 8)`}
      />
    </svg>
  );
}

function StepButton(
  {
    step,
    className,
    disabled,
    onClick,
    ...rest
  }: ButtonProps & { step: "previous" | "next" },
  ref: React.ForwardedRef<HTMLButtonElement>,
) {
  const { t } = useCloverTranslation();
  const navigation = useNavigation();
  const { direction } = useSequence();
  if (navigation.total < 2) return null;

  const isNext = step === "next";
  const available = isNext ? navigation.hasNext : navigation.hasPrevious;
  const rotate = NEXT_ROTATION[direction] + (isNext ? 0 : 180);
  const label = t(isNext ? "commonNext" : "commonPrevious");
  return (
    <button
      ref={ref}
      type="button"
      className={join(`clover-pager-${step}`, className)}
      data-direction={direction}
      disabled={disabled || !available}
      onClick={(event) => {
        onClick?.(event);
        if (!event.defaultPrevented) navigation[step]();
      }}
      {...rest}
    >
      <Chevron rotate={rotate} />
      <span style={visuallyHidden}>{label}</span>
      <Tip label={label} />
    </button>
  );
}

/** Go to the previous view. Disabled on the first. */
export const Previous = forwardRef<HTMLButtonElement, ButtonProps>(
  function Previous(props, ref) {
    return StepButton({ ...props, step: "previous" }, ref);
  },
);

/** Go to the next view. Disabled on the last. */
export const Next = forwardRef<HTMLButtonElement, ButtonProps>(
  function Next(props, ref) {
    return StepButton({ ...props, step: "next" }, ref);
  },
);

export interface PositionProps extends React.HTMLAttributes<HTMLElement> {
  as?: React.ElementType;
}

/**
 * Where the reader is, counted in views: "2 / 5", the same in every language. Assistive
 * technology reads the sentence instead, "Item 2 of 5" in the reader's language, which a
 * bare slash would leave to guesswork.
 */
export const Position = forwardRef<HTMLElement, PositionProps>(
  function Position({ as: Tag = "span", className, ...rest }, ref) {
    const { t } = useCloverTranslation();
    const { position, total } = useNavigation();
    if (total < 2) return null;
    const index = position + 1;
    return (
      <Tag
        ref={ref}
        className={join("clover-pager-position", className)}
        {...rest}
      >
        <span aria-hidden="true">
          {index} / {total}
        </span>
        <span style={visuallyHidden}>
          {t("canvasPosition", { index, total })}
        </span>
      </Tag>
    );
  },
);

export interface PagerProps extends React.HTMLAttributes<HTMLElement> {
  as?: React.ElementType;
}

/**
 * `Previous`, `Position` and `Next`, in a `nav`, laid out as the book reads: `Next` comes
 * first in a right-to-left book.
 */
export const Pager = forwardRef<HTMLElement, PagerProps>(function Pager(
  { as: Tag = "nav", className, ...rest },
  ref,
) {
  const { t } = useCloverTranslation();
  const { total } = useNavigation();
  const { direction } = useSequence();
  if (total < 2) return null;
  return (
    <Tag
      ref={ref}
      aria-label={t("pagerLabel")}
      className={join("clover-pager", className)}
      data-direction={direction}
      {...rest}
    >
      {/* A right-to-left book reads leftwards, so "next" sits on the left. */}
      {direction === "right-to-left" ? <Next /> : <Previous />}
      <Position />
      {direction === "right-to-left" ? <Previous /> : <Next />}
    </Tag>
  );
});
