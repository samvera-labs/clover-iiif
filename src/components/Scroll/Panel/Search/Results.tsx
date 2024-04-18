import {
  StyledSearchAnnotationInformation,
  StyledSearchAnnotations,
  StyledSearchTag,
} from "src/components/Scroll/Panel/Search/Search.styled";

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
      <StyledSearchAnnotationInformation>
        <StyledSearchTag>{annotation.motivation}</StyledSearchTag>
        <span>{annotation?.body?.language}</span>
      </StyledSearchAnnotationInformation>
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
    <StyledSearchAnnotations>
      {results.found.map((annotation) => (
        <ScrollSearchResultsButton
          annotation={annotation}
          isResult
          key={annotation.id}
        />
      ))}
      <hr />
      {results.notFound.map((annotation) => (
        <ScrollSearchResultsButton
          annotation={annotation}
          key={annotation.id}
        />
      ))}
    </StyledSearchAnnotations>
  );
};

export default ScrollSearchResults;
