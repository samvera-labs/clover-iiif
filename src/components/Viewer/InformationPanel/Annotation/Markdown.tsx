import React from "react";
import useMarkdown from "src/hooks/useMarkdown";

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
    <button className="clover-viewer-annotation-button" onClick={handleClick}>
      <div
        className="clover-viewer-annotation-content"
        dangerouslySetInnerHTML={{ __html: markdownContent.html }}
      />
    </button>
  );
};

export default AnnotationItemMarkdown;
