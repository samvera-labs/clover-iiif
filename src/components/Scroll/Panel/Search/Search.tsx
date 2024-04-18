import FlexSearch, { IndexOptionsForDocumentSearch } from "flexsearch";
import React, { useContext } from "react";
import {
  StyledSearch,
  StyledSearchAnnotationsResultsLabel,
} from "src/components/Scroll/Panel/Search/Search.styled";

import { AnnotationFlattened } from "src/types/annotations";
import { ScrollContext } from "src/context/scroll-context";
import ScrollSearchResults from "src/components/Scroll/Panel/Search/Results";

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

const ScrollSearch = () => {
  const { state } = useContext(ScrollContext);
  const { annotations, searchString = "" } = state;

  const index = new FlexSearch.Document(config);
  const indexIds: string[] = [];
  annotations?.forEach((annotation) => {
    annotation?.body?.forEach((body) => {
      // @ts-expect-error
      const content = body?.value?.replace(/\n/g, "");
      indexIds.push(body?.id);
      index.add({
        id: body?.id,
        content,
      });
    });
  });

  function mapAnnotationBodies(array): AnnotationFlattened[] {
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

  const results: {
    found: AnnotationFlattened[];
    notFound: AnnotationFlattened[];
  } = {
    found: mapAnnotationBodies(searchResults),
    notFound: mapAnnotationBodies(
      indexIds.filter((id) => !searchResults.includes(id)),
    ),
  };

  return (
    <StyledSearch>
      {searchString && (
        <StyledSearchAnnotationsResultsLabel>
          {results.found?.length} results for <strong>{searchString}</strong>
        </StyledSearchAnnotationsResultsLabel>
      )}
      <ScrollSearchResults results={results} />
    </StyledSearch>
  );
};

export default ScrollSearch;
