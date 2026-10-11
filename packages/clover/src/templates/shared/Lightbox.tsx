import React, { useEffect, useId, useRef } from "react";

import * as Clover from "../../parts";

export interface LightboxProps {
  open: boolean;
  onClose: () => void;
  className?: string;
}

/**
 * The current Canvas in a modal `<dialog>`: its label, the stage, and the pager (with the
 * position). A native dialog keeps focus inside, closes on Escape, and returns focus to
 * whatever opened it. The stage mounts only while open, so it is sized when drawn.
 */
export function Lightbox({ open, onClose, className }: LightboxProps) {
  const t = Clover.useT();
  const dialog = useRef<HTMLDialogElement>(null);
  const titleId = `${useId().replace(/:/g, "")}-title`;

  useEffect(() => {
    const element = dialog.current;
    if (!element) return;
    if (open && !element.open) element.showModal?.();
    if (!open && element.open) element.close();
  }, [open]);

  return (
    <dialog
      ref={dialog}
      className={["clover-template-lightbox", className]
        .filter(Boolean)
        .join(" ")}
      aria-labelledby={titleId}
      onClose={onClose}
      // A press on the backdrop (the dialog itself, outside its content) closes it.
      onClick={(event) => {
        if (event.target === dialog.current) onClose();
      }}
    >
      {open && (
        <div className="clover-template-lightbox-body">
          <header className="clover-template-lightbox-header">
            <Clover.Label of="canvas" as="h3" id={titleId} />
            <button
              type="button"
              className="clover-template-lightbox-close"
              aria-label={t("commonClose")}
              onClick={onClose}
            >
              <svg
                aria-hidden="true"
                focusable="false"
                width="16"
                height="16"
                viewBox="0 0 16 16"
              >
                <path
                  d="M3 3l10 10M13 3L3 13"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                />
              </svg>
            </button>
          </header>
          <Clover.Content className="clover-template-lightbox-stage" />
          <Clover.Pager />
        </div>
      )}
    </dialog>
  );
}
