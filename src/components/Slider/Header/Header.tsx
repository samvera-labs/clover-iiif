import { ContentResource, InternationalString } from "@iiif/presentation-3";
import { HeaderContent, HeaderControls, HeaderStyled } from "./Header.styled";
import { Homepage, Label, Summary } from "src/components/Primitives";
import { IconButton, Link, Text } from "@radix-ui/themes";
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
            as={Link}
            size="5"
            weight="medium"
            className="clover-slider-header-homepage"
          >
            <Label label={label} className="clover-slider-header-label" />
          </Homepage>
        ) : (
          <Label
            label={label}
            as={Text}
            size="5"
            weight="medium"
            className="clover-slider-header-label"
          />
        )}

        {summary && (
          <Summary
            summary={summary}
            as={Text}
            className="clover-slider-header-summary"
          />
        )}
      </HeaderContent>
      <HeaderControls>
        <IconButton
          className={`clover-slider-previous-${instance}`}
          aria-label="previous"
        >
          <PreviousIcon />
        </IconButton>
        <IconButton
          className={`clover-slider-next-${instance}`}
          aria-label="next"
        >
          <NextIcon />
        </IconButton>
        {hasHomepage && (
          <ViewAll
            homepage={homepage}
            className="clover-slider-header-view-all"
          />
        )}
      </HeaderControls>
    </HeaderStyled>
  );
};

export default Header;
