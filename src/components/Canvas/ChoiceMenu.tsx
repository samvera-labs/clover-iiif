import React, { useEffect, useRef } from "react";

import type {
  ChoiceGroup,
  ChoiceSelections,
} from "src/components/Canvas/layout";
import { getLabelAsString } from "src/lib/label-helpers";

interface ChoiceMenuProps {
  id: string;
  /** The control that opens the menu, which toggles it itself. */
  triggerId: string;
  label: string;
  choices: ChoiceGroup[];
  selections: ChoiceSelections;
  onSelect: (key: string, index: number) => void;
  /** Close, returning focus to the control that opened it when `restoreFocus`. */
  onClose: (restoreFocus: boolean) => void;
}

/**
 * The items of each `Choice` on the Canvas, as radio buttons: one is painted at a time.
 *
 * Native radios in a fieldset, so a reader moves between items with the arrow keys and
 * hears the group's name and the current item. It closes on Escape, returning focus to
 * the control, and on a press outside.
 */
const ChoiceMenu: React.FC<ChoiceMenuProps> = ({
  id,
  triggerId,
  label,
  choices,
  selections,
  onSelect,
  onClose,
}) => {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    ref.current?.querySelector<HTMLInputElement>("input:checked")?.focus();

    const onPointerDown = (event: PointerEvent) => {
      const target = event.target as Element | null;
      if (ref.current?.contains(target)) return;
      // The control that opens the menu toggles it itself.
      if (document.getElementById(triggerId)?.contains(target)) return;
      onClose(false);
    };
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose(true);
    };
    document.addEventListener("pointerdown", onPointerDown);
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("pointerdown", onPointerDown);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [triggerId, onClose]);

  return (
    <div
      className="clover-canvas-choice"
      data-testid="clover-canvas-choice"
      id={id}
      ref={ref}
    >
      {choices.map((group, g) => {
        // Only text the Manifest provides is shown; the group's name falls back to the
        // control's for assistive technology alone.
        const heading = getLabelAsString(group.label as any);
        return (
          <fieldset
            aria-label={heading ? undefined : label}
            className="clover-canvas-choice-group"
            key={group.key}
          >
            {heading && (
              <legend className="clover-canvas-choice-legend">{heading}</legend>
            )}
            {group.items.map((item, index) => {
              const text = getLabelAsString(item.label as any);
              return (
                <label className="clover-canvas-choice-item" key={index}>
                  <input
                    type="radio"
                    name={`${id}-${g}`}
                    aria-label={text ? undefined : String(index + 1)}
                    checked={(selections[group.key] ?? 0) === index}
                    onChange={() => onSelect(group.key, index)}
                  />
                  {text && <span>{text}</span>}
                </label>
              );
            })}
          </fieldset>
        );
      })}
    </div>
  );
};

export default ChoiceMenu;
