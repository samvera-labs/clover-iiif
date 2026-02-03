import { ButtonStyled, StyledAnnotationContent } from "./Item.styled";

import React from "react";

type AnnotationItemPlainTextProps = {
  value: string;
  handleClick: (e) => void;
  isContentSearch?: boolean;
};

const toHtml = (value: string) => String(value || "").replace(/\n/g, "<br />");

const AnnotationItemPlainText: React.FC<AnnotationItemPlainTextProps> = ({
  value,
  handleClick,
  isContentSearch,
}) => {
  const htmlValue = toHtml(value);

  return (
    <ButtonStyled onClick={handleClick}>
      <StyledAnnotationContent
        dangerouslySetInnerHTML={{ __html: htmlValue }}
        data-content-search={isContentSearch}
      />
    </ButtonStyled>
  );
};

export default AnnotationItemPlainText;
