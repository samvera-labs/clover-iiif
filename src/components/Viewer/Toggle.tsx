import { useViewerDispatch } from "@/context/viewer-context";
import React, { useEffect, useState } from "react";
import { Flex, Label, StyledSwitch, StyledThumb } from "./Toggle.styled";

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
    <form>
      <Flex css={{ alignItems: "center" }}>
        <Label htmlFor="information-toggle" css={{ paddingRight: "1rem" }}>
          More Information
        </Label>
        <StyledSwitch
          checked={checked}
          onCheckedChange={() => setChecked(!checked)}
          id="information-toggle"
        >
          <StyledThumb />
        </StyledSwitch>
      </Flex>
    </form>
  );
};

export default Toggle;
