import { ContentResource, InternationalString } from "@iiif/presentation-3";
import { Homepage, Label, Summary } from "src/components/Primitives";
import { PrimitivesExternalWebResource } from "src/types/primitives";
import React from "react";

import { NextIcon } from "src/components/Slider/Icons/NextIcon";
import { PreviousIcon } from "src/components/Slider/Icons/PrevIcon";
import ViewAll from "./ViewAll";
import { useCloverTranslation } from "src/i18n/useCloverTranslation";
import {
  sliderControlButton,
  sliderControlIcon,
  sliderHeader,
  sliderHeaderContent,
  sliderHeaderControls,
  sliderHeaderLabel,
  sliderHeaderSummary,
} from "./Header.css";

interface HeaderProps {
  homepage?: ContentResource[];
  instance: number;
  label: InternationalString;
  summary: InternationalString;
}

const Header: React.FC<HeaderProps> = ({
  homepage,
  instance,
  label,
  summary,
}) => {
  const { t } = useCloverTranslation();
  const normalizedHomepage =
    homepage as unknown as PrimitivesExternalWebResource[] | undefined;
  const hasHomepage = Boolean(normalizedHomepage?.length);

  return (
    <div className={sliderHeader} data-testid="slider-header">
      <div className={sliderHeaderContent}>
        {hasHomepage && normalizedHomepage ? (
          <Homepage
            homepage={normalizedHomepage}
            className="clover-slider-header-homepage"
          >
            <Label
              label={label}
              as="span"
              className={`${sliderHeaderLabel} clover-slider-header-label`}
            />
          </Homepage>
        ) : (
          <Label
            label={label}
            as="span"
            className={`${sliderHeaderLabel} clover-slider-header-label`}
          />
        )}

        {summary && (
          <Summary
            summary={summary}
            as="span"
            className={`${sliderHeaderSummary} clover-slider-header-summary`}
          />
        )}
      </div>
      <div className={sliderHeaderControls}>
        <button
          className={`${sliderControlButton} clover-slider-previous-${instance}`}
          aria-label={t("commonPrevious")}
          type="button"
        >
          <span className={sliderControlIcon}>
            <PreviousIcon />
          </span>
        </button>
        <button
          className={`${sliderControlButton} clover-slider-next-${instance}`}
          aria-label={t("commonNext")}
          type="button"
        >
          <span className={sliderControlIcon}>
            <NextIcon />
          </span>
        </button>
        {hasHomepage && normalizedHomepage && (
          <ViewAll
            homepage={normalizedHomepage}
            className="clover-slider-header-view-all"
          />
        )}
      </div>
    </div>
  );
};

export default Header;
