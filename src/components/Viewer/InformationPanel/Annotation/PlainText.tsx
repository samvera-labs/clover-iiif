import { ButtonStyled } from "./Item.styled";
import React from "react";

type AnnotationItemPlainTextProps = {
  value: string;
  handleClick: (e) => void;
};

const AnnotationItemPlainText: React.FC<AnnotationItemPlainTextProps> = ({
  value,
  handleClick,
}) => <ButtonStyled onClick={handleClick}>{value}</ButtonStyled>;
export default AnnotationItemPlainText;
