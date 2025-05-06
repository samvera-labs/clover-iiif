import * as Form from "@radix-ui/react-form";

import { ButtonStyled, FormStyled } from "./ContentSearchForm.styled";
import React, { useState } from "react";
import { ViewerContextStore, useViewerState } from "src/context/viewer-context";

import { AnnotationPageNormalized } from "@iiif/presentation-3";
import { AnnotationResource } from "src/types/annotations";
import { getContentSearchResources } from "src/hooks/use-iiif";
import { useTranslation } from "react-i18next";

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
  const { t } = useTranslation();
  const [searchTerms, setSearchTerms] = useState<string | undefined>();

  const viewerState: ViewerContextStore = useViewerState();
  const { openSeadragonViewer, vault } = viewerState;

  async function searchSubmitHandler(e) {
    e.preventDefault();

    if (!openSeadragonViewer) return;
    if (!searchServiceUrl) return;
    if (!searchTerms || searchTerms.trim() === "") {
      setContentSearchResource({} as unknown as AnnotationPageNormalized);
      return;
    }

    setLoading(true);

    getContentSearchResources(vault, searchServiceUrl, {
      q: searchTerms,
    }).then((resources) => {
      setContentSearchResource(resources);
      setLoading(false);
    });
  }

  const handleChange = (e: any) => {
    e.preventDefault();
    setSearchTerms(e.target.value);
  };

  const placeholder = t("contentSearchPlaceholder");

  return (
    <FormStyled>
      <Form.Root onSubmit={searchSubmitHandler} className="content-search-form">
        <Form.Field
          className="content-search-input"
          name="searchTerms"
          onChange={handleChange}
        >
          <Form.Control placeholder={placeholder} />
        </Form.Field>

        <Form.Submit asChild>
          <ButtonStyled type="submit">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512">
              <title>{t("informationPanelTabsSearch")}</title>
              <path d="M456.69 421.39L362.6 327.3a173.81 173.81 0 0034.84-104.58C397.44 126.38 319.06 48 222.72 48S48 126.38 48 222.72s78.38 174.72 174.72 174.72A173.81 173.81 0 00327.3 362.6l94.09 94.09a25 25 0 0035.3-35.3zM97.92 222.72a124.8 124.8 0 11124.8 124.8 124.95 124.95 0 01-124.8-124.8z" />
            </svg>
          </ButtonStyled>
        </Form.Submit>
      </Form.Root>
    </FormStyled>
  );
};

export default SearchContent;
