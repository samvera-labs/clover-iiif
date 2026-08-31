import React from "react";

import { join } from "src/lib/classnames";

interface ButtonProps {
  className?: string;
  id: string;
  label: string;
  children: React.ReactChild;
  /*
   * Only the full-screen control passes one. The rest are bound by OpenSeadragon through
   * their id, which is why this is optional rather than required.
   */
  onClick?: React.MouseEventHandler<HTMLButtonElement>;
}

const Button: React.FC<ButtonProps> = ({
  className,
  id,
  label,
  children,
  onClick,
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
      className={join("clover-iiif-image-openseadragon-button", className)}
      data-testid="openseadragon-button"
      data-button={dataButton}
      onClick={onClick}
      type="button"
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
