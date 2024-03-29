import { InternationalString } from "@iiif/presentation-3";
import { Label } from "src/components/Primitives";
import { StyledScrollHeader } from "src/components/Scroll/Layout/Layout.styled";

const ScrollHeader = ({ label }: { label: InternationalString }) => {
  return (
    <StyledScrollHeader>
      <strong>
        <Label label={label} />
      </strong>
    </StyledScrollHeader>
  );
};

export default ScrollHeader;
