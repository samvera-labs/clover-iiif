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
    <button className="clover-viewer-annotation-button" onClick={handleClick}>
      <div
        className="clover-viewer-annotation-content"
        dangerouslySetInnerHTML={{ __html: value }}
      />
    </button>
  );
};

export default AnnotationItemHTML;
