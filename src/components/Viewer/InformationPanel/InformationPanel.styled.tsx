import { ScrollArea, Tabs } from "@radix-ui/themes";

import { styled } from "src/styles/stitches.config";

const StyledTabsRoot = styled(Tabs.Root, {
  display: "flex",
  flexDirection: "column",
  width: "100%",
  height: "100%",
  maskImage: `linear-gradient(180deg, rgba(0, 0, 0, 1) calc(100% - 2rem), transparent 100%)`,
});

const StyledScrollArea = styled(ScrollArea, {
  flexGrow: 1,
});

export { StyledScrollArea, StyledTabsRoot };
