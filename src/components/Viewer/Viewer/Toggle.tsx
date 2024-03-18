import {
  Label,
  StyledSwitch,
  StyledThumb,
  StyledToggle,
} from "src/components/Viewer/Viewer/Toggle.styled";
import React, { useEffect, useState } from "react";
import { useViewerDispatch, useViewerState } from "src/context/viewer-context";

const Toggle = () => {
  const { configOptions } = useViewerState();
  const dispatch: any = useViewerDispatch();

  const [checked, setChecked] = useState(configOptions?.informationPanel?.open);

  useEffect(() => {
    dispatch({
      type: "updateInformationOpen",
      isInformationOpen: checked,
    });
  }, [checked, dispatch]);

  return (
    <StyledToggle>
      <Label htmlFor="information-toggle" css={checked ? { opacity: "1" } : {}}>
        More Information
      </Label>
      <StyledSwitch
        checked={checked}
        onCheckedChange={() => setChecked(!checked)}
        id="information-toggle"
        aria-label="information panel toggle"
        name="toggled?"
      >
        <StyledThumb />
      </StyledSwitch>
    </StyledToggle>
  );
};

export default Toggle;
