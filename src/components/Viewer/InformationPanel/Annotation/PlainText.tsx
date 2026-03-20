import React from "react";
import { annotationButton, annotationContent } from "./Annotation.css";

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
    <button className={annotationButton} onClick={handleClick}>
      <div
        className={annotationContent}
        dangerouslySetInnerHTML={{ __html: htmlValue }}
        data-content-search={isContentSearch}
      />
    </button>
  );
};

export default AnnotationItemPlainText;
