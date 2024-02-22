import { ButtonStyled } from "./Item.styled";
import React from "react";

type AnnotationItemPlainTextProps = {
  value: string;
  handleClick: (e) => void;
  target: string;
  canvas: string;
};

const AnnotationItemPlainText: React.FC<AnnotationItemPlainTextProps> = ({
  value,
  handleClick,
  target,
  canvas,
}) => {
  return (
    <ButtonStyled
      onClick={handleClick}
      data-target={target}
      data-canvas={canvas}
    >
      {value}
    </ButtonStyled>
  );
};

export default AnnotationItemPlainText;
