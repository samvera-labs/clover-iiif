import { ButtonStyled, StyledAnnotationContent } from "./Item.styled";

import React from "react";

type AnnotationItemHTMLProps = {
  value: string;
  handleClick: (e) => void;
};

const AnnotationItemHTML: React.FC<AnnotationItemHTMLProps> = ({
  value,
  handleClick,
}) => {
  return (
    <ButtonStyled onClick={handleClick}>
      <StyledAnnotationContent dangerouslySetInnerHTML={{ __html: value }} />
    </ButtonStyled>
  );
};

export default AnnotationItemHTML;
