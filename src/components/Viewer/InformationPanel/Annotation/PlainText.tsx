import { ButtonStyled, StyledAnnotationContent } from "./Item.styled";

import React from "react";

type AnnotationItemPlainTextProps = {
  value: string;
  handleClick: (e) => void;
  isContentSearch?: boolean;
};

const AnnotationItemPlainText: React.FC<AnnotationItemPlainTextProps> = ({
  value,
  handleClick,
  isContentSearch,
}) => {
  return (
    <ButtonStyled onClick={handleClick}>
      <StyledAnnotationContent
        dangerouslySetInnerHTML={{ __html: value }}
        data-content-search={isContentSearch}
      />
    </ButtonStyled>
  );
};

export default AnnotationItemPlainText;
