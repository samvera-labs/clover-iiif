import { Flex, IconButton, TextField } from "@radix-ui/themes";

import { styled } from "src/styles/stitches.config";

const Form = styled(Flex, {
  position: "absolute",
  right: "1rem",
  top: "1rem",
  zIndex: "1",
});

const Input = styled(TextField.Root, {
  width: "100%",
});

const Button = styled(IconButton, {
  cursor: "pointer",

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
  backgroundColor: "var(--gray-4)",
  borderRadius: "var(--radius-6)",
  boxShadow: "var(--shadow-3)",
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
