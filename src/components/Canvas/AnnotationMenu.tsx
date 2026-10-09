import React from "react";

import type { PlacedAnnotation } from "src/components/Canvas/Annotations";
import ControlMenu from "src/components/Canvas/ControlMenu";

interface AnnotationMenuProps {
  id: string;
  /** The control that opens the menu, which toggles it itself. */
  triggerId: string;
  label: string;
  annotations: PlacedAnnotation[];
  /** The annotation last picked, which is checked. */
  selected: string | null;
  onSelect: (annotation: PlacedAnnotation) => void;
  /** Hovering or focusing an item highlights its hotspot; `null` when it leaves. */
  onActivate: (id: string | null) => void;
  /** Close, returning focus to the control that opened it when `restoreFocus`. */
  onClose: (restoreFocus: boolean) => void;
}

/**
 * The Canvas's annotations, listed by their text: picking one zooms to it, as clicking
 * its hotspot does, and the menu stays open to move on to the next. One without text is
 * listed by its number.
 */
const AnnotationMenu: React.FC<AnnotationMenuProps> = ({
  id,
  triggerId,
  label,
  annotations,
  selected,
  onSelect,
  onActivate,
  onClose,
}) => (
  <ControlMenu
    data-testid="clover-canvas-annotation-menu"
    id={id}
    onClose={onClose}
    triggerId={triggerId}
  >
    <fieldset aria-label={label} className="clover-canvas-menu-group">
      {annotations.map((annotation, index) => (
        <label
          className="clover-canvas-menu-item"
          data-active={selected === annotation.id ? "true" : undefined}
          key={annotation.id}
          onMouseEnter={() => onActivate(annotation.id)}
          onMouseLeave={() => onActivate(null)}
        >
          <input
            type="radio"
            name={id}
            checked={selected === annotation.id}
            onChange={() => onSelect(annotation)}
            // Re-picking the checked item zooms back to it.
            onClick={() => selected === annotation.id && onSelect(annotation)}
            onFocus={() => onActivate(annotation.id)}
            onBlur={() => onActivate(null)}
          />
          <span>{annotation.label ?? String(index + 1)}</span>
        </label>
      ))}
    </fieldset>
  </ControlMenu>
);

export default AnnotationMenu;
