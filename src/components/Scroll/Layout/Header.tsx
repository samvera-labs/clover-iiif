import { InternationalString } from "@iiif/presentation-3";
import { Label } from "src/components/Primitives";
import React from "react";
import { StyledScrollHeader } from "src/components/Scroll/Layout/Layout.styled";

interface ScrollHeaderProps {
  label: InternationalString;
}

const ScrollHeader: React.FC<ScrollHeaderProps> = ({ label }) => {
  return (
    <StyledScrollHeader>
      <strong>
        <Label label={label} />
      </strong>
    </StyledScrollHeader>
  );
};

export default ScrollHeader;
