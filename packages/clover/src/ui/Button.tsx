import React from "react";

import { join } from "../lib/classnames";

interface ButtonProps {
  className?: string;
  id: string;
  label: string;
  children: React.ReactChild;
  onClick?: React.MouseEventHandler<HTMLButtonElement>;
  /** For a control that opens something (Canvas's Choice menu): its state and target. */
  expanded?: boolean;
  controls?: string;
}

const Button: React.FC<ButtonProps> = ({
  className,
  id,
  label,
  children,
  onClick,
  expanded,
  controls,
}) => {
  // Extract button type from id (e.g., "rotateLeft-abc123" → "rotate-left")
  // This ensures data-button is language-independent for CSS selectors
  const buttonType = id.split("-")[0];
  const dataButton = buttonType
    .replace(/([A-Z])/g, "-$1")
    .toLowerCase()
    .replace(/^-/, "");
  return (
    <button
      id={id}
      className={join("clover-canvas-button", className)}
      data-testid="clover-canvas-button"
      data-button={dataButton}
      onClick={onClick}
      aria-expanded={expanded}
      aria-controls={controls}
      type="button"
    >
      <svg
        xmlns="http://www.w3.org/2000/svg"
        aria-labelledby={`${id}-svg-title`}
        data-testid="clover-canvas-button-svg"
        focusable="false"
        viewBox="0 0 512 512"
        role="img"
      >
        <title id={`${id}-svg-title`}>{label}</title>
        {children}
      </svg>
    </button>
  );
};

export default Button;
