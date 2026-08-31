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
    <button className="clover-viewer-annotation-button" onClick={handleClick}>
      <div
        className="clover-viewer-annotation-content"
        dangerouslySetInnerHTML={{ __html: htmlValue }}
        data-content-search={isContentSearch}
      />
    </button>
  );
};

export default AnnotationItemPlainText;
