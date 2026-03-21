import React from "react";
import useMarkdown from "src/hooks/useMarkdown";
import { annotationButton, annotationContent } from "./Annotation.css";

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
    <button className={annotationButton} onClick={handleClick}>
      <div
        className={annotationContent}
        dangerouslySetInnerHTML={{ __html: markdownContent.html }}
      />
    </button>
  );
};

export default AnnotationItemMarkdown;
