import { Flex } from "@radix-ui/themes";
import { styled } from "src/styles/stitches.config";

const Wrapper = styled(Flex, {
  position: "absolute",
  zIndex: "2",
  display: "flex",
});

export { Wrapper };
