import React from "react";

import ControlMenu from "./ControlMenu";
import type { ChoiceGroup, ChoiceSelections } from "./layout";
import { getLabelAsString } from "../../core/label";

interface ChoiceMenuProps {
  id: string;
  /** The control that opens the menu, which toggles it itself. */
  triggerId: string;
  label: string;
  /** Each group's key, its name and its items: a Canvas's Choices, or its frames. */
  choices: Array<Pick<ChoiceGroup, "key" | "label" | "items">>;
  selections: ChoiceSelections;
  onSelect: (key: string, index: number) => void;
  /** Close, returning focus to the control that opened it when `restoreFocus`. */
  onClose: (restoreFocus: boolean) => void;
}

/**
 * The items of each `Choice` on the Canvas, as radio buttons: one is painted at a time.
 * An animation's frames are offered the same way, each with its picture.
 */
const ChoiceMenu: React.FC<ChoiceMenuProps> = ({
  id,
  triggerId,
  label,
  choices,
  selections,
  onSelect,
  onClose,
}) => (
  <ControlMenu
    data-testid="clover-canvas-choice"
    id={id}
    onClose={onClose}
    triggerId={triggerId}
  >
    {choices.map((group, g) => {
      // Only text the Manifest provides is shown; the group's name falls back to the
      // control's for assistive technology alone.
      const heading = getLabelAsString(group.label as any);
      return (
        <fieldset
          aria-label={heading ? undefined : label}
          className="clover-canvas-menu-group"
          key={group.key}
        >
          {heading && (
            <legend className="clover-canvas-menu-legend">{heading}</legend>
          )}
          {group.items.map((item, index) => {
            const text = getLabelAsString(item.label as any);
            return (
              <label className="clover-canvas-menu-item" key={index}>
                <input
                  type="radio"
                  name={`${id}-${g}`}
                  aria-label={text ? undefined : String(index + 1)}
                  checked={(selections[group.key] ?? 0) === index}
                  onChange={() => onSelect(group.key, index)}
                />
                {item.image && (
                  // eslint-disable-next-line @next/next/no-img-element -- This library also renders outside Next.js.
                  <img
                    alt=""
                    className="clover-canvas-menu-image"
                    decoding="async"
                    loading="lazy"
                    src={item.image}
                  />
                )}
                {text && <span>{text}</span>}
              </label>
            );
          })}
        </fieldset>
      );
    })}
  </ControlMenu>
);

export default ChoiceMenu;
