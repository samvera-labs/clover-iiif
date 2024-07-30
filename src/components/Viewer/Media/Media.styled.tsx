import * as RadioGroup from "@radix-ui/react-radio-group";

import { styled } from "src/styles/stitches.config";

const Group = styled(RadioGroup.Root, {
  display: "flex",
  flexDirection: "row",
  flexGrow: "1",
  padding: "var(--space-6) 0",
  overflowX: "scroll",
  position: "relative",
  zIndex: "0",
});

export { Group };
