import * as RadioGroup from "@radix-ui/react-radio-group";
import { styled } from "stitches";

const Group = styled(RadioGroup.Root, {
  display: "flex",
  flexDirection: "row",
  flexGrow: "1",
  padding: "1.618rem",
  overflowX: "scroll",
  position: "relative",
  zIndex: "0",
});

export { Group };
