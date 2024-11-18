import FlexSearch, { IndexOptionsForDocumentSearch } from "flexsearch";
import React, { useContext, useEffect, useState } from "react";

import { AnnotationFlattened } from "src/types/annotations";
import { ScrollContext } from "src/context/scroll-context";
import SearchAnnotationsResultsLabel from "./ResultsLabel";
import { StyledSearch } from "src/components/Scroll/Panel/Search/Search.styled";

const ArrowIcon = ({
  title,
  style = {},
}: {
  title: string;
  style?: React.CSSProperties;
}) => {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" style={style}>
      <title>{title}</title>
      <path
        fill="none"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeMiterlimit="10"
        strokeWidth="45"
        d="M244 400L100 256l144-144M120 256h292"
      />
    </svg>
  );
};

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
  const [activeIndex, setActiveIndex] = useState(0);
  const { dispatch, state } = useContext(ScrollContext);
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

  const searchResults = index?.search(searchString).reduce((acc, curr) => {
    return [...new Set([...acc, ...curr.result])];
  }, []);

  //
  const searchMatches = findMatches(
    mapAnnotationBodies(searchResults),
    searchString,
  );

  const searchMatchesFlattened = searchMatches.matches.flatMap((match) => {
    return Object.values(match).flat();
  });

  useEffect(() => {
    setActiveIndex(0);
    dispatch({
      type: "updateSearchMatches",
      payload: searchMatches,
    });
    dispatch({
      type: "updateSearchActiveMatch",
      payload: undefined,
    });
  }, [searchString]);

  useEffect(() => {
    dispatch({
      type: "updateSearchActiveMatch",
      payload: searchMatchesFlattened[activeIndex],
    });
  }, [activeIndex, searchString]);

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

  function findMatches(annotations, searchString) {
    const regex = new RegExp(searchString, "gi");
    const result = { total: 0, matches: [] };

    annotations.forEach((annotation) => {
      const bodyId = annotation.body.id;
      const bodyValue = annotation.body.value;
      const matchArray: string[] = [];
      let matchCount = 0;
      let match;

      while ((match = regex.exec(bodyValue)) !== null) {
        matchCount++;
        matchArray.push(`${bodyId}/${matchCount}`);
      }

      if (matchCount > 0) {
        result.total += matchCount;
        // @ts-expect-error
        result.matches.push({ [bodyId]: matchArray });
      }
    });

    return result;
  }

  const handleNext = () =>
    setActiveIndex((prevIndex) =>
      prevIndex < searchMatchesFlattened.length - 1 ? prevIndex + 1 : 0,
    );

  const handlePrevious = () =>
    setActiveIndex((prevIndex) =>
      prevIndex > 0 ? prevIndex - 1 : searchMatchesFlattened.length - 1,
    );

  return (
    <StyledSearch data-active={Boolean(searchString)}>
      {searchString && (
        <SearchAnnotationsResultsLabel
          activeIndex={activeIndex}
          searchString={searchString}
          total={searchMatches.total}
        />
      )}
      {searchMatches?.total !== 0 && (
        <>
          <button onClick={handlePrevious}>
            <ArrowIcon
              title="previous"
              style={{ transform: "rotate(90deg)" }}
            />
          </button>
          <button onClick={handleNext}>
            <ArrowIcon title="next" style={{ transform: "rotate(270deg)" }} />
          </button>
        </>
      )}
    </StyledSearch>
  );
};

export default ScrollSearch;
