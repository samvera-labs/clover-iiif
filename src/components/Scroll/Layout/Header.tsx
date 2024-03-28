import { InternationalString } from "@iiif/presentation-3";
import { Label } from "src/components/Primitives";
import { StyledScrollHeader } from "./Layout.styled";

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
