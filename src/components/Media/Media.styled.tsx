import * as RadioGroup from "@radix-ui/react-radio-group";
import { styled } from "@stitches/react";

const Group = styled(RadioGroup.Root, {
  display: "flex",
  flexDirection: "row",
  flexGrow: "1",
  padding: "1.618rem 0.618rem 1.618rem 0 ",
  overflowX: "scroll",
});

export { Group };
