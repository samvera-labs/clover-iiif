import * as Form from "@radix-ui/react-form";

import { Control } from "src/components/Shared/Control/Control";
import { SearchIcon } from "src/components/Shared/Control/Icons";
import { SearchInput } from "src/components/Shared/Search/Search";
import React, { useState } from "react";
import { ViewerContextStore, useViewerState } from "src/context/viewer-context";

import { AnnotationPageNormalized } from "@iiif/presentation-3";
import { AnnotationResource } from "src/types/annotations";
import { getContentSearchResources } from "src/hooks/use-iiif";
import { useCloverTranslation } from "src/i18n/useCloverTranslation";

type Props = {
  searchServiceUrl?: string;
  setContentSearchResource: React.Dispatch<
    React.SetStateAction<AnnotationResource | undefined>
  >;
  activeCanvas: string;
  setLoading: React.Dispatch<React.SetStateAction<boolean>>;
  contentSearchCallback?: (query: string) => void;
  initialSearchQuery?: string;
};

const SearchContent: React.FC<Props> = ({
  searchServiceUrl,
  setContentSearchResource,
  setLoading,
  contentSearchCallback,
  initialSearchQuery,
}) => {
  const { t } = useCloverTranslation();
  const [searchTerms, setSearchTerms] = useState<string | undefined>(
    initialSearchQuery,
  );

  const viewerState: ViewerContextStore = useViewerState();
  const { vault } = viewerState;

  async function searchSubmitHandler(e) {
    e.preventDefault();

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
    const query = e.target.value;
    setSearchTerms(query);
    contentSearchCallback?.(query);
  };

  const placeholder = t("contentSearchPlaceholder");

  return (
    <div className="clover-viewer-content-search-form">
      <Form.Root onSubmit={searchSubmitHandler} className="content-search-form">
        <Form.Field className="content-search-input" name="searchTerms">
          {/* `asChild` so the field is the shared input, not a restyled copy of it. */}
          <Form.Control asChild>
            <SearchInput
              defaultValue={initialSearchQuery}
              onChange={handleChange}
              placeholder={placeholder}
              type="text"
            />
          </Form.Control>
        </Form.Field>

        <Form.Submit asChild>
          <Control
            aria-label={t("informationPanelTabsSearch")}
            className="clover-search-submit"
            type="submit"
          >
            <SearchIcon />
          </Control>
        </Form.Submit>
      </Form.Root>
    </div>
  );
};

export default SearchContent;
