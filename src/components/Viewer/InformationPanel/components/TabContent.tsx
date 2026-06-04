import React from "react";
import { Content } from "../InformationPanel.styled";
import Information from "../About/About";
import ContentSearch from "../ContentSearch/ContentSearch";
import ContentStateAnnotationPage from "../ContentState/Page";
import AnnotationCollectionPage from "../AnnotationCollection/Page";
import AnnotationPage from "../Annotation/Page";
import type { AnnotationResources, AnnotationResource } from "src/types/annotations";
import type { AnnotationPageNormalized } from "@iiif/presentation-3";

interface TabContentProps {
  renderAbout?: boolean;
  renderContentSearch?: boolean;
  contentSearchResource?: AnnotationResource;
  searchServiceUrl?: string;
  setContentSearchResource: React.Dispatch<
    React.SetStateAction<AnnotationPageNormalized | undefined>
  >;
  activeCanvas: string;
  contentSearchCallback?: (query: string) => void;
  initialSearchQuery?: string;
  renderAnnotation?: boolean;
  hasAnnotations: boolean;
  contentStateAnnotation?: import("@iiif/presentation-3").AnnotationNormalized | null;
  hasContentStateAnnotation: boolean;
  filteredAnnotationResources: AnnotationResources;
  hasAnnotationCollection: boolean;
  annotationCollection?: import("src/types/annotation-collection").AnnotationCollectionNormalized | null;
}

export const TabContent: React.FC<TabContentProps> = ({
  renderAbout,
  renderContentSearch,
  contentSearchResource,
  searchServiceUrl,
  setContentSearchResource,
  activeCanvas,
  contentSearchCallback,
  initialSearchQuery,
  renderAnnotation,
  hasAnnotations,
  contentStateAnnotation,
  hasContentStateAnnotation,
  filteredAnnotationResources,
  hasAnnotationCollection,
  annotationCollection,
}) => {
  return (
    <>
      {renderAbout && (
        <Content value="manifest-about">
          <Information />
        </Content>
      )}
      {renderContentSearch && contentSearchResource && (
        <Content value="manifest-content-search">
          <ContentSearch
            searchServiceUrl={searchServiceUrl}
            setContentSearchResource={setContentSearchResource}
            activeCanvas={activeCanvas}
            annotationPage={contentSearchResource}
            contentSearchCallback={contentSearchCallback}
            initialSearchQuery={initialSearchQuery}
          />
        </Content>
      )}
      {renderAnnotation && hasAnnotations && (
        <Content value="manifest-annotations">
          {contentStateAnnotation && hasContentStateAnnotation && (
            <ContentStateAnnotationPage
              contentStateAnnotation={contentStateAnnotation}
            />
          )}
          {filteredAnnotationResources.map((annotationPage) => (
            <AnnotationPage
              key={annotationPage.id}
              annotationPage={annotationPage}
            />
          ))}
          {hasAnnotationCollection && annotationCollection && (
            <AnnotationCollectionPage annotationCollection={annotationCollection} />
          )}
        </Content>
      )}
    </>
  );
};
