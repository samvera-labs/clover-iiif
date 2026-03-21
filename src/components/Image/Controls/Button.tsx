import { controlButton } from "src/components/Image/Controls/Controls.css";
import React from "react";

interface ButtonProps {
  className?: string;
  id: string;
  label: string;
  children: React.ReactChild;
}

const Button: React.FC<ButtonProps> = ({ className, id, label, children }) => {
  // Extract button type from id (e.g., "rotateLeft-abc123" → "rotate-left")
  // This ensures data-button is language-independent for CSS selectors
  const buttonType = id.split("-")[0];
  const dataButton = buttonType
    .replace(/([A-Z])/g, "-$1")
    .toLowerCase()
    .replace(/^-/, "");
  const classes = [controlButton, className].filter(Boolean).join(" ");
  return (
    <button
      id={id}
      className={classes}
      data-testid="openseadragon-button"
      data-button={dataButton}
      type="button"
      aria-label={label}
    >
      <svg
        xmlns="http://www.w3.org/2000/svg"
        aria-labelledby={`${id}-svg-title`}
        data-testid="openseadragon-button-svg"
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
