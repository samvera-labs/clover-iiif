import React, { useState } from "react";
import * as Form from "@radix-ui/react-form";
import { AnnotationPageNormalized } from "@iiif/presentation-3";
import { getContentSearchResources } from "src/hooks/use-iiif";
import { ViewerContextStore, useViewerState } from "src/context/viewer-context";
import { AnnotationResource } from "src/types/annotations";
import { FormStyled } from "./Item.styled";

type Props = {
  searchServiceUrl?: string;
  setContentSearchResource: React.Dispatch<
    React.SetStateAction<AnnotationResource | undefined>
  >;
  activeCanvas: string;
  setLoading: React.Dispatch<React.SetStateAction<boolean>>;
};

const SearchContent: React.FC<Props> = ({
  searchServiceUrl,
  setContentSearchResource,
  setLoading,
}) => {
  const [searchTerms, setSearchTerms] = useState<string | undefined>();

  const viewerState: ViewerContextStore = useViewerState();
  const { contentSearchVault, openSeadragonViewer, configOptions } =
    viewerState;
  const searchText = configOptions.localeText?.contentSearch;

  async function searchSubmitHandler(e) {
    e.preventDefault();
    const tabLabel = searchText?.tabLabel as string;

    if (!openSeadragonViewer) return;
    if (!searchTerms || searchTerms.trim() === "") {
      // must return a label because Information Panel tab requires a label
      setContentSearchResource({
        label: { none: [tabLabel] },
      } as unknown as AnnotationPageNormalized);
      return;
    }

    setLoading(true);

    const url = searchServiceUrl + "?q=" + searchTerms.trim();
    getContentSearchResources(contentSearchVault, url, tabLabel).then(
      (resources) => {
        setContentSearchResource(resources);
        setLoading(false);
      },
    );
  }

  const handleChange = (e: any) => {
    e.preventDefault();
    setSearchTerms(e.target.value);
  };

  return (
    <FormStyled>
      <Form.Root onSubmit={searchSubmitHandler} className="content-search-form">
        <Form.Field name="searchTerms" onChange={handleChange}>
          <Form.Control placeholder={searchText?.formPlaceholder} />
        </Form.Field>
      </Form.Root>
    </FormStyled>
  );
};

export default SearchContent;
