import {
  searchAnnotationInformation,
  searchAnnotations,
  searchTag,
} from "src/components/Scroll/Panel/Search/Search.css";

import { AnnotationFlattened } from "src/types/annotations";
import React from "react";
import ScrollAnnotationBody from "src/components/Scroll/Annotation/Body";

const ScrollSearchResultsButton = ({
  annotation,
  isResult,
}: {
  annotation: AnnotationFlattened;
  isResult?: boolean;
}) => {
  const bodyId = [annotation?.body?.id, "content"].join("-");

  const handleScrollToId = (id) => {
    if (id) document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <button
      data-result={isResult ? "true" : "false"}
      onClick={() => handleScrollToId(bodyId)}
      key={bodyId}
    >
      <div className={searchAnnotationInformation}>
        <span className={searchTag}>{annotation.motivation}</span>
        <span>{annotation?.body?.language}</span>
      </div>
      <ScrollAnnotationBody
        body={annotation.body}
        stringLength={144}
        type="snippet"
      />
    </button>
  );
};

const ScrollSearchResults = ({
  results,
}: {
  results: {
    found: AnnotationFlattened[];
    notFound: AnnotationFlattened[];
  };
}) => {
  return (
    <div className={searchAnnotations}>
      {results.found.map((annotation) => (
        <ScrollSearchResultsButton
          annotation={annotation}
          isResult
          key={annotation.id}
        />
      ))}
      {results.notFound.map((annotation) => (
        <ScrollSearchResultsButton
          annotation={annotation}
          key={annotation.id}
        />
      ))}
    </div>
  );
};

export default ScrollSearchResults;
