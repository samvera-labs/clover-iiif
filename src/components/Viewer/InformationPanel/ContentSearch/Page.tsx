import React, { useState } from "react";
import {
  AnnotationNormalized,
  AnnotationPageNormalized,
} from "@iiif/presentation-3";
import ContentSearchItem from "./Item";
import { List, ResultsHeader, ResultsFooter } from "./Item.styled";
import { ViewerContextStore, useViewerState } from "src/context/viewer-context";
import { getLabel } from "src/hooks/use-iiif";

type Props = {
  annotationPage: AnnotationPageNormalized;
};
type GroupedAnnotations = {
  [k: string]: AnnotationNormalized[];
};
export const ContentSearchPage: React.FC<Props> = ({ annotationPage }) => {
  const viewerState: ViewerContextStore = useViewerState();
  const { contentSearchVault, configOptions } = viewerState;
  const [activeContentSearchTarget, setActiveContentSearchTarget] = useState<
    string | undefined
  >();

  const searchResultsLimit = configOptions.contentSearch?.searchResultsLimit;
  const searchText = configOptions.localeText?.contentSearch;

  function formatAnnotationPage(annotationPage: AnnotationPageNormalized) {
    const groupedAnnotations: GroupedAnnotations = {};
    annotationPage.items.forEach((item) => {
      const annotation = contentSearchVault.get(
        item.id,
      ) as AnnotationNormalized;
      let label = "";
      if (annotation.label) {
        const internationalLabel = getLabel(annotation.label);
        if (internationalLabel) {
          label = internationalLabel[0];
        }
      }

      if (groupedAnnotations[label] == undefined) {
        groupedAnnotations[label] = [];
      }
      groupedAnnotations[label].push(annotation);
    });
    return groupedAnnotations;
  }

  function renderSearchResults(
    annotations: AnnotationNormalized[],
  ): React.JSX.Element[] {
    const annotationsShown = searchResultsLimit
      ? annotations.slice(0, searchResultsLimit)
      : annotations;

    return annotationsShown.map((annotation, i) => (
      <ContentSearchItem
        key={i}
        annotation={annotation}
        activeContentSearchTarget={activeContentSearchTarget}
        setActiveContentSearchTarget={setActiveContentSearchTarget}
      />
    ));
  }

  function renderMoreResultsMessage(annotations: AnnotationNormalized[]) {
    if (searchResultsLimit) {
      const moreCount = annotations.length - searchResultsLimit;
      if (moreCount > 0) {
        return (
          <ResultsFooter>
            {moreCount} {searchText?.moreResults}
          </ResultsFooter>
        );
      }
    }
  }

  if (
    !annotationPage ||
    !annotationPage.items ||
    annotationPage.items?.length === 0
  )
    return <p>{searchText?.noSearchResults}</p>;

  return (
    <>
      {Object.entries(formatAnnotationPage(annotationPage)).map(
        ([label, annotations], i) => {
          return (
            <div key={i}>
              <ResultsHeader className="content-search-results-title">
                {label}
              </ResultsHeader>
              <List className="content-search-results">
                {renderSearchResults(annotations)}
              </List>
              {renderMoreResultsMessage(annotations)}
            </div>
          );
        },
      )}
    </>
  );
};

export default ContentSearchPage;
