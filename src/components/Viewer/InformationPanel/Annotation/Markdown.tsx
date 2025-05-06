import { ButtonStyled, StyledAnnotationContent } from "./Item.styled";

import React from "react";
import useMarkdown from "@nulib/use-markdown";

type AnnotationItemPlainTextProps = {
  value: string;
  handleClick: (e) => void;
};

const AnnotationItemMarkdown: React.FC<AnnotationItemPlainTextProps> = ({
  value,
  handleClick,
}) => {
  const markdownContent = useMarkdown(value);

  return (
    <ButtonStyled onClick={handleClick}>
      <StyledAnnotationContent
        dangerouslySetInnerHTML={{ __html: markdownContent.html }}
      />
    </ButtonStyled>
  );
};

export default AnnotationItemMarkdown;
