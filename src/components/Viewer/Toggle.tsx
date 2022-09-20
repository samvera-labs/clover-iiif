import React from "react";
import { Flex, Label, StyledSwitch, StyledThumb } from "./Toggle.styled";

const Toggle = () => (
  <form>
    <Flex css={{ alignItems: "center" }}>
      <Label htmlFor="information-toggle" css={{ paddingRight: "1rem" }}>
        More Information
      </Label>
      <StyledSwitch defaultChecked id="information-toggle">
        <StyledThumb />
      </StyledSwitch>
    </Flex>
  </form>
);

export default Toggle;
