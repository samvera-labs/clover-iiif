import React, { Suspense, lazy, useEffect, useRef, useState } from "react";

import { Close } from "src/components/Canvas/glyphs";
import type { IIIFCanvas } from "src/components/Canvas/layout";
import Button from "src/components/Image/Controls/Button";
import { useCloverTranslation } from "src/i18n/useCloverTranslation";
import { getLabelAsString } from "src/lib/label-helpers";

/**
 * The summary and metadata, sanitised by the Primitives. Fetched the first time the
 * caption opens, so their HTML sanitiser (DOMPurify) costs a Canvas nothing until then.
 */
const CaptionDetails = lazy(
  () => import("src/components/Canvas/CaptionDetails"),
);

/** Whether a Canvas has anything for the caption to show: a `summary` or `metadata`. */
export function hasInformation(canvas: IIIFCanvas): boolean {
  return Boolean(canvas.summary) || Boolean(canvas.metadata?.length);
}

/** The id of a captioned Canvas's label, which also names the `<figure>`. */
export const captionLabelId = (id: string, index: number) =>
  `${id}-label-${index}`;

interface CaptionProps {
  id: string;
  /** The shown Canvases that have information, in reading order. */
  canvases: IIIFCanvas[];
  open: boolean;
  /** Close, returning focus to the control that opened it when `restoreFocus`. */
  onClose: (restoreFocus: boolean) => void;
}

/**
 * The `<figcaption>` of the Canvas's `<figure>`: each shown Canvas's label, `summary` and
 * `metadata` (Cookbook 0029, "metadata anywhere"), in a box that slides out over the
 * picture from the information control.
 *
 * Not a menu: it stays open while the reader pans and zooms, and closes only from its
 * own close button, the control, or Escape inside it. Opening moves focus into it.
 */
const Caption: React.FC<CaptionProps> = ({ id, canvases, open, onClose }) => {
  const { t } = useCloverTranslation();
  const ref = useRef<HTMLElement>(null);
  // Kept once loaded, so the box slides away with its content still in it.
  const [opened, setOpened] = useState(open);
  if (open && !opened) setOpened(true);

  useEffect(() => {
    if (open) ref.current?.focus();
  }, [open]);

  return (
    <figcaption
      className="clover-canvas-caption"
      data-open={open}
      data-testid="clover-canvas-caption"
      id={id}
      onKeyDown={(event) => {
        if (event.key !== "Escape") return;
        event.stopPropagation();
        onClose(true);
      }}
      ref={ref}
      tabIndex={-1}
    >
      <Button
        className="clover-canvas-caption-close"
        id={`close-${id}`}
        label={t("commonClose")}
        onClick={() => onClose(true)}
      >
        <Close />
      </Button>
      {canvases.map((canvas, index) => {
        const label = getLabelAsString(canvas.label as any);
        return (
          <section className="clover-canvas-caption-canvas" key={canvas.id}>
            {label && (
              <p
                className="clover-canvas-caption-label"
                id={captionLabelId(id, index)}
              >
                {label}
              </p>
            )}
            {opened && (
              <Suspense fallback={null}>
                <CaptionDetails
                  summary={canvas.summary}
                  metadata={canvas.metadata}
                />
              </Suspense>
            )}
          </section>
        );
      })}
    </figcaption>
  );
};

export default Caption;
