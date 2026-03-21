import React from "react";
import { annotationButton, annotationContent } from "./Annotation.css";

type AnnotationItemHTMLProps = {
  value: string;
  handleClick: (e) => void;
};

const AnnotationItemHTML: React.FC<AnnotationItemHTMLProps> = ({
  value,
  handleClick,
}) => {
  return (
    <button className={annotationButton} onClick={handleClick}>
      <div
        className={annotationContent}
        dangerouslySetInnerHTML={{ __html: value }}
      />
    </button>
  );
};

export default AnnotationItemHTML;
