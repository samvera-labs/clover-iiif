import React from "react";
import { Item } from "./Button.styled";

interface ButtonProps {
  id: string;
  label: string;
  children: React.ReactChild;
}

const Button: React.FC<ButtonProps> = ({ id, label, children }) => {
  return (
    <Item id={id} data-testid="openseadragon-button">
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
