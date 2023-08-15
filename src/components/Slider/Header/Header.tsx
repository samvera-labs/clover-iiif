import { ContentResource, InternationalString } from "@iiif/presentation-3";
import { ControlStyled, Icon } from "./Control.styled";
import { HeaderContent, HeaderControls, HeaderStyled } from "./Header.styled";
import { Homepage, Label, Summary } from "src/components/Primitives";
import React, { useEffect, useState } from "react";

import { NextIcon } from "src/components/Slider/Icons/NextIcon";
import { PreviousIcon } from "src/components/Slider/Icons/PrevIcon";
import ViewAll from "./ViewAll";

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
  const [hasHomepage, setHasHomepage] = useState<boolean>(false);

  useEffect(() => {
    if (homepage && homepage?.length > 0) setHasHomepage(true);
  }, [homepage]);

  return (
    <HeaderStyled data-testid="slider-header">
      <HeaderContent>
        {hasHomepage ? (
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
        )}

        {summary && (
          <Summary
            summary={summary}
            as="span"
            className="clover-slider-header-summary"
          />
        )}
      </HeaderContent>
      <HeaderControls>
        <ControlStyled
          className={`clover-slider-previous-${instance}`}
          aria-label="previous"
        >
          <Icon>
            <PreviousIcon />
          </Icon>
        </ControlStyled>
        <ControlStyled
          className={`clover-slider-next-${instance}`}
          aria-label="next"
        >
          <Icon>
            <NextIcon />
          </Icon>
        </ControlStyled>
        {hasHomepage && (
          <Homepage
            // @ts-ignore
            homepage={homepage}
            className="clover-slider-header-view-all"
          >
            <ViewAll />
          </Homepage>
        )}
      </HeaderControls>
    </HeaderStyled>
  );
};

export default Header;
