import { Item } from "src/components/Image/Controls/Button.styled";
import React from "react";

interface ButtonProps {
  className?: string;
  id: string;
  label: string;
  children: React.ReactChild;
}

const Button: React.FC<ButtonProps> = ({ className, id, label, children }) => {
  const dataButton = label.toLowerCase().replace(/\s/g, "-");
  return (
    <Item
      id={id}
      className={className}
      data-testid="openseadragon-button"
      data-button={dataButton}
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
    </Item>
  );
};

export default Button;
