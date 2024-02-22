import React, { useState } from "react";
import ContentSearchAnnotationPage from "src/components/Viewer/InformationPanel/ContentSearch/Page";
import { AnnotationPageNormalized } from "@iiif/presentation-3";
import ContentSearchForm from "src/components/Viewer/InformationPanel/ContentSearch/ContentSearchForm";
import { AnnotationResource } from "src/types/annotations";
import { Container } from "./Item.styled";

type ContentSearchProps = {
  searchServiceUrl?: string;
  setContentSearchResource: React.Dispatch<
    React.SetStateAction<AnnotationPageNormalized | undefined>
  >;
  activeCanvas: string;
  annotationPage: AnnotationResource;
};

const ContentSearch: React.FC<ContentSearchProps> = ({
  searchServiceUrl,
  setContentSearchResource,
  activeCanvas,
  annotationPage,
}) => {
  const [loading, setLoading] = useState(false);

  return (
    <Container>
      <ContentSearchForm
        searchServiceUrl={searchServiceUrl}
        setContentSearchResource={setContentSearchResource}
        activeCanvas={activeCanvas}
        setLoading={setLoading}
      />
      {!loading && (
        <ContentSearchAnnotationPage annotationPage={annotationPage} />
      )}
      {loading && <span>Loading...</span>}
    </Container>
  );
};

export default ContentSearch;
