import { ButtonStyled, StyledAnnotationContent } from "./Item.styled";

import React from "react";

type AnnotationItemPlainTextProps = {
  value: string;
  handleClick: (e) => void;
};

const AnnotationItemPlainText: React.FC<AnnotationItemPlainTextProps> = ({
  value,
  handleClick,
}) => {
  return (
    <ButtonStyled onClick={handleClick}>
      <StyledAnnotationContent dangerouslySetInnerHTML={{ __html: value }} />
    </ButtonStyled>
  );
};

export default AnnotationItemPlainText;
