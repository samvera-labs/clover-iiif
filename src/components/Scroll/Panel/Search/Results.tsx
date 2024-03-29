import {
  Document as FlexSearchDocumentIndex,
  IndexOptionsForDocumentSearch,
} from "flexsearch";
import React, { useContext } from "react";
import {
  StyledSearch,
  StyledSearchAnnotationInformation,
  StyledSearchAnnotations,
  StyledSearchTag,
} from "src/components/Scroll/Panel/Search/Search.styled";

import { ScrollContext } from "src/context/scroll-context";

const config: IndexOptionsForDocumentSearch<{
  id: string;
  content: string;
}> = {
  charset: "latin:extra, arabic:extra, cyrillic:extra, cjk:extra",
  optimize: true,
  tokenize: "full",
  resolution: 9,
  document: {
    id: "id",
    index: "content",
  },
};

interface ScrollSearchProps {
  isPanelExpanded: boolean;
}

const ScrollSearch: React.FC<ScrollSearchProps> = ({ isPanelExpanded }) => {
  const { state } = useContext(ScrollContext);
  const { annotations, searchString = "" } = state;

  const index = new FlexSearchDocumentIndex(config);
  const indexIds: string[] = [];
  annotations?.forEach((annotation) => {
    annotation?.body?.forEach((body) => {
      // @ts-ignore
      const content = body?.value?.replace(/\n/g, "");
      indexIds.push(body?.id);
      index.add({
        id: body?.id,
        content,
      });
    });
  });

  function mapAnnotationBodies(array) {
    return array.map((id) => {
      return annotations
        ?.filter((annotation) => {
          return annotation.body.find((body) => body.id === id);
        })
        .map((annotation) => {
          const bodyIndex = annotation.body.findIndex((body) => body.id === id);
          return {
            ...annotation,
            body: annotation.body[bodyIndex],
          };
        })
        .shift();
    });
  }

  const searchResults = index?.search(searchString).reduce((acc, curr) => {
    return [...new Set([...acc, ...curr.result])];
  }, []);

  const results = {
    found: mapAnnotationBodies(searchResults),
    notFound: mapAnnotationBodies(
      indexIds.filter((id) => !searchResults.includes(id)),
    ),
  };

  const handleScrollToId = (id) => {
    if (id)
      document?.getElementById(id)?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <StyledSearch>
      <StyledSearchAnnotations>
        {results.found.map((annotation) => {
          return (
            <button
              data-result="true"
              disabled={!isPanelExpanded}
              onClick={() => handleScrollToId(annotation.body.id)}
              key={annotation.id}
            >
              <StyledSearchAnnotationInformation>
                <StyledSearchTag>{annotation.motivation}</StyledSearchTag>
                <span>{annotation.body.language}</span>
              </StyledSearchAnnotationInformation>
              <span>{annotation.body.value.slice(0, 150)}...</span>
            </button>
          );
        })}
        {results.notFound.map((annotation) => {
          return (
            <button
              data-result="false"
              disabled={!isPanelExpanded}
              key={annotation.id}
              onClick={() => handleScrollToId(annotation.body.id)}
            >
              <StyledSearchAnnotationInformation>
                <StyledSearchTag>{annotation.motivation}</StyledSearchTag>
                <span>{annotation.body.language}</span>
              </StyledSearchAnnotationInformation>
              <span>{annotation.body.value.slice(0, 150)}...</span>
            </button>
          );
        })}
      </StyledSearchAnnotations>
    </StyledSearch>
  );
};

export default ScrollSearch;
