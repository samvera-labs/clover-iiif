import { ItemHTMLWrapper } from "./Item.styled";
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
    <ItemHTMLWrapper
      dangerouslySetInnerHTML={{ __html: value }}
      onClick={handleClick}
    />
  );
};

export default AnnotationItemHTML;
