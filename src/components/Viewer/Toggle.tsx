import { useViewerDispatch } from "@/context/viewer-context";
import React, { useEffect, useState } from "react";
import {
  Label,
  StyledSwitch,
  StyledThumb,
  StyledToggle,
  Wrapper,
} from "@/components/Viewer/Toggle.styled";

const Toggle = () => {
  const dispatch: any = useViewerDispatch();

  const [checked, setChecked] = useState(true);

  useEffect(() => {
    dispatch({
      type: "updateInformationExpanded",
      informationExpanded: checked,
    });
  }, [checked]);

  return (
    <StyledToggle>
      <Wrapper>
        <Label
          htmlFor="information-toggle"
          css={checked ? { opacity: "1" } : {}}
        >
          More Information
        </Label>
        <StyledSwitch
          checked={checked}
          onCheckedChange={() => setChecked(!checked)}
          id="information-toggle"
        >
          <StyledThumb />
        </StyledSwitch>
      </Wrapper>
    </StyledToggle>
  );
};

export default Toggle;
