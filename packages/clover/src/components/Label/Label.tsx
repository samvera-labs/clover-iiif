import React, { forwardRef } from "react";

import { selectSequence } from "../../core/selectors";
import { toPlainText } from "../../core/text";
import { type LanguageMapLike, localize } from "../../core/value";
import { join } from "../../lib/classnames";
import {
  useOptionalClover,
  useOptionalCloverSelector,
} from "../../react/context";

export interface LabelProps
  extends Omit<React.HTMLAttributes<HTMLElement>, "lang"> {
  /** Whose label: the Manifest's (the default), or the current Canvas's. */
  of?: "manifest" | "canvas";
  /** A label to show instead of the Root's. Outside a `Root`, the label to show. */
  label?: LanguageMapLike;
  /** The element to render, such as `h1`. Default `span`. */
  as?: React.ElementType;
}

/**
 * A label, in the Root's language and marked with the language it is in. Renders nothing
 * while there is none.
 */
export const Label = forwardRef<HTMLElement, LabelProps>(function Label(
  { of = "manifest", label, as: Tag = "span", className, ...rest },
  ref,
) {
  const fromRoot = useOptionalCloverSelector(
    (state) =>
      (of === "canvas"
        ? selectSequence(state.manifest).canvases.find(
            (canvas) => canvas.id === state.canvasId,
          )?.label
        : state.manifest?.label) as LanguageMapLike,
    undefined,
  );
  const language = useOptionalClover()?.language;
  const { text, lang } = localize(label ?? fromRoot, language);
  if (!text) return null;
  return (
    <Tag
      ref={ref}
      className={join("clover-label", className)}
      lang={lang}
      {...rest}
    >
      {toPlainText(text)}
    </Tag>
  );
});
