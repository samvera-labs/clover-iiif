import * as Checkbox from "@radix-ui/react-checkbox";

import {
  StyledContent,
  StyledTrigger,
} from "src/components/UI/Popover/Popover.styled";

import { styled } from "src/styles/stitches.config";

const StyledScrollLanguage = styled("div", {
  width: "2rem",

  [`${StyledTrigger}`]: {
    background: "$primary",
    width: "inherit",
    display: "flex",
    justifyContent: "center",
    borderRadius: "2rem",

    "&:hover": {
      background: "$accent",
    },

    svg: {
      fill: "$secondary",
    },
  },

  [`${StyledContent}`]: {
    "> label": {
      fontSize: "0.8333rem",
      display: "flex",
      marginBottom: "0.5rem",
    },
  },
});

const StyledScrollLanguageOptionCheckbox = styled("div", {
  width: "1rem",
  height: "1rem",
  borderRadius: "3px",
  backgroundColor: "$secondaryMuted",
  border: "1px solid $secondaryAlt",
  display: "inline-flex",
  fontSize: "0.7222rem",
  alignContent: "center",
  justifyContent: "center",
  textAlign: "center",
  flexDirection: "column",
});

const StyledScrollLanguageOptionIndicator = styled(Checkbox.Indicator, {
  marginTop: "-1px",
});

const StyledScrollLanguageOption = styled(Checkbox.Root, {
  display: "flex",
  alignContent: "center",
  alignItems: "center",
  gap: "0.5rem",

  "&[data-state='checked']": {
    [`${StyledScrollLanguageOptionCheckbox}`]: {
      backgroundColor: "$accent",
      borderColor: "$accent",
      color: "$secondary",
    },
  },
});

export {
  StyledScrollLanguage,
  StyledScrollLanguageOption,
  StyledScrollLanguageOptionCheckbox,
  StyledScrollLanguageOptionIndicator,
};
