import type React from "react";

/**
 * Everything a control needs in order to work, ready to spread onto a button: the id, the
 * accessible name, the click handler and the icon. Spreading `buttonProps` keeps the wiring
 * while the element, its shape and its styling stay the consumer's.
 */
export type ControlButtonProps = {
  buttonProps: {
    id: string;
    type: "button";
    "aria-label": string;
    onClick?: React.MouseEventHandler<HTMLButtonElement>;
    /** On a control that opens a menu (the Choice control): its state and target. */
    "aria-expanded"?: boolean;
    "aria-controls"?: string;
  };
  icon: React.ReactNode;
  label: string;
};

/**
 * Replacements for the controls over a Canvas. Each key is optional, so a consumer can
 * override one control and leave the rest as they are. A replacement owns the whole
 * button, not just the glyph, so it can change shape as well as appearance.
 */
export type ControlButtons = {
  zoomIn?: React.ComponentType<ControlButtonProps>;
  zoomOut?: React.ComponentType<ControlButtonProps>;
  fullPage?: React.ComponentType<ControlButtonProps>;
  rotateRight?: React.ComponentType<ControlButtonProps>;
  rotateLeft?: React.ComponentType<ControlButtonProps>;
  reset?: React.ComponentType<ControlButtonProps>;
  choice?: React.ComponentType<ControlButtonProps>;
};
