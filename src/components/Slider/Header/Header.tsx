import { ContentResource, InternationalString } from "@iiif/presentation-3";
import { Homepage, Label, Summary } from "src/components/Primitives";
import {
  CloseIcon,
  NextIcon,
  PreviousIcon,
  SearchIcon,
} from "src/components/Shared/Control/Icons";
import React, { useEffect, useState } from "react";

import { Control } from "src/components/Shared/Control/Control";
import { SearchInput } from "src/components/Shared/Search/Search";
import { getLabelAsString } from "src/lib/label-helpers";
import type { SliderPager } from "src/types/slider";
import ViewAll from "./ViewAll";
import useKeyPress from "src/hooks/useKeyPress";
import { useCloverTranslation } from "src/i18n/useCloverTranslation";

interface HeaderProps {
  canScrollNext?: boolean;
  canScrollPrev?: boolean;
  homepage?: ContentResource[];
  /** Right-to-left control order, for a paged resource read that way. */
  isRtl?: boolean;
  label: InternationalString;
  onScrollNext?: () => void;
  onScrollPrev?: () => void;
  onSearch?: (query: string) => void;
  pager?: SliderPager;
  search?: boolean;
  summary: InternationalString;
}

/**
 * The one control surface.
 *
 * This used to be the Slider's alone, while the Viewer drew its own bar absolutely
 * positioned over the thumbnails, with a counter and a filter the Slider had no notion of.
 * Both render this now: the counter and the filter are opt-in, so what a host shows is a
 * choice rather than a second implementation.
 */
const Header: React.FC<HeaderProps> = ({
  canScrollNext = false,
  canScrollPrev = false,
  homepage,
  isRtl = false,
  label,
  onScrollNext,
  onScrollPrev,
  onSearch,
  pager,
  search = false,
  summary,
}) => {
  const { t } = useCloverTranslation();
  const [hasHomepage, setHasHomepage] = useState<boolean>(false);

  /*
   * Whether there is any text to draw.
   *
   * Both default to `{ none: [""] }`, which is truthy — so a host that supplies neither, as
   * the Viewer does, got two empty spans. They measured 0×0 but carried the
   * `clover-slider-header-*` class hooks and the summary's top margin, which meant anyone
   * styling those names saw phantom elements in the Viewer's header.
   */
  const hasLabel = Boolean(getLabelAsString(label)?.trim());
  const hasSummary = Boolean(getLabelAsString(summary)?.trim());
  const [isFiltering, setIsFiltering] = useState<boolean>(false);

  useEffect(() => {
    if (homepage && homepage?.length > 0) setHasHomepage(true);
  }, [homepage]);

  /** Dismiss the filter on Escape, clearing whatever it had narrowed. */
  useKeyPress("Escape", () => {
    setIsFiltering(false);
    onSearch?.("");
  });

  const handleFilterToggle = () => {
    setIsFiltering((previous) => !previous);
    onSearch?.("");
  };

  /*
   * A pager takes the arrows over entirely.
   *
   * Without one they scroll the rail, which is what a Collection carousel wants. With one
   * they step the host's sequence and the rail follows the selection — the Viewer's arrows
   * change the canvas on show, they do not slide the thumbnails out from under it.
   */
  const stepsPager = Boolean(pager);
  const canGoBack = pager ? pager.current > 1 : canScrollPrev;
  const canGoForward = pager ? pager.current < pager.total : canScrollNext;
  const goBack = pager ? () => pager.onStep(-1) : onScrollPrev;
  const goForward = pager ? () => pager.onStep(1) : onScrollNext;

  /*
   * Right-to-left swaps both the order and the artwork: the forward control comes first
   * and points left. Reading direction is the reader's, not the widget's.
   */
  const back = (
    <Control
      className="clover-slider-previous"
      aria-label={t("sliderPrevious")}
      disabled={!canGoBack}
      key="previous"
      onClick={goBack}
      type="button"
    >
      {isRtl ? <NextIcon /> : <PreviousIcon />}
    </Control>
  );

  const forward = (
    <Control
      className="clover-slider-next"
      aria-label={t("sliderNext")}
      disabled={!canGoForward}
      key="next"
      onClick={goForward}
      type="button"
    >
      {isRtl ? <PreviousIcon /> : <NextIcon />}
    </Control>
  );

  return (
    <div className="clover-slider-header" data-testid="slider-header">
      {/*
       * Rendered even with nothing in it. `HeaderStyled` spaces its two children apart, so
       * this element is what holds the controls to the right; drop it and they slide left.
       */}
      <div className="clover-slider-header-content">
        {hasLabel &&
          (hasHomepage ? (
            <Homepage
              // @ts-ignore
              homepage={homepage}
              className="clover-slider-header-homepage"
            >
              <Label
                label={label}
                as="span"
                className="clover-slider-header-label"
              />
            </Homepage>
          ) : (
            <Label
              label={label}
              as="span"
              className="clover-slider-header-label"
            />
          ))}

        {hasSummary && (
          <Summary
            summary={summary}
            as="span"
            className="clover-slider-header-summary"
          />
        )}
      </div>
      <div className="clover-slider-header-controls">
        {/*
         * The filter field takes the counter's place rather than sitting beside it. Both
         * report on the same sequence, and only one of them is useful at a time.
         */}
        {isFiltering ? (
          <SearchInput
            autoFocus
            className="clover-slider-search-input"
            onChange={(event: React.ChangeEvent<HTMLInputElement>) =>
              onSearch?.(event.target.value)
            }
            placeholder={t("commonSearchPlaceholder")}
            type="text"
          />
        ) : (
          stepsPager && (
            <span className="clover-slider-counter">
              {pager?.current} <em>/</em> {pager?.total}
            </span>
          )
        )}

        {/*
         * Driven by props rather than by class name. These used to carry
         * `clover-slider-previous-${instance}` purely so `Items` could find them with
         * `document.querySelector` and attach listeners by hand — two components
         * reaching for the same DOM node from opposite directions. The classes stay for
         * consumer CSS; the wiring is now ordinary React.
         */}
        {isRtl ? [forward, back] : [back, forward]}

        {search && (
          <Control
            aria-label={
              isFiltering ? t("sliderSearchClose") : t("sliderSearch")
            }
            className="clover-slider-search"
            onClick={handleFilterToggle}
            type="button"
          >
            {isFiltering ? <CloseIcon /> : <SearchIcon />}
          </Control>
        )}

        {hasHomepage && (
          <ViewAll
            homepage={homepage}
            className="clover-slider-header-view-all"
          />
        )}
      </div>
    </div>
  );
};

export default Header;
