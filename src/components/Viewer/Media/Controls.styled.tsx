import { Flex, IconButton, TextField } from "@radix-ui/themes";

import { styled } from "src/styles/stitches.config";

const Form = styled(Flex, {
  position: "absolute",
  right: "var(--space-4)",
  top: "var(--space-4)",
  zIndex: "1",
});

const Input = styled(TextField.Root, {
  width: "100%",
});

const Button = styled(IconButton, {
  cursor: "pointer",

  "&[data-disabled=true]": {
    cursor: "unset",
    color: "var(--accent-8)",
    fill: "var(--accent-8)",
    stroke: "var(--accent-8)",
  },

  svg: {
    color: "currentColor",
    fill: "currentColor",
    stroke: "currentColor",
    transition: "$all",
    height: "60%",
    width: "60%",
  },
});

const Direction = styled(Flex, {
  marginRight: "var(--space-3)",
  backgroundColor: "var(--accent-12)",
  color: "var(--gray-1)",
});

const Wrapper = styled("div", {
  display: "flex",
  position: "relative",
  zIndex: "1",
  width: "100%",
  padding: "0",
  transition: "$all",

  variants: {
    isToggle: {
      true: {
        paddingTop: "2.618rem",

        [`& ${Form}`]: {
          width: "calc(100% - 2rem)",

          "@sm": {
            width: "calc(100% - 2rem)",
          },
        },
      },
    },
  },
});

export { Button, Direction, Form, Input, Wrapper };
