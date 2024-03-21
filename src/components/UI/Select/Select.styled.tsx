import * as Select from "@radix-ui/react-select";

import { styled } from "src/styles/stitches.config";

const StyledSelectIcon = styled("svg", {
  height: "19px",
  color: "$accent",
  fill: "$accent",
  stroke: "$accent",
  display: "flex",
  margin: "0.25rem 0.85rem",
});

const StyledSelectButton = styled(Select.Trigger, {
  fontSize: "1.25rem",
  fontWeight: "400",
  fontFamily: "inherit",
  alignSelf: "flex-start",
  flexGrow: "1",
  cursor: "pointer",
  transition: "$all",
  border: "1px solid #6663",
  boxShadow: "2px 2px 5px #0001",
  borderRadius: "3px",
  display: "flex",
  alignItems: "center",
  paddingLeft: "0.5rem",
  width: "100%",

  "@sm": {
    fontSize: "1rem",
  },
});

const StyledSelectContent = styled(Select.Content, {
  borderRadius: "3px",
  boxShadow: "3px 3px 8px #0003",
  backgroundColor: "$secondary",
  marginTop: "2.25rem",
  marginLeft: "6px",
  paddingBottom: "0.25rem",
  maxHeight: "calc(61.8vh - 2.5rem) !important",
  borderTopLeftRadius: "0",
  border: "1px solid $secondaryMuted",
  maxWidth: "90vw",
});

const StyledSelectItem = styled(Select.Item, {
  display: "flex",
  alignItems: "center",
  fontFamily: "inherit",
  padding: "0.25rem 0.5rem",
  color: "$primary",
  fontWeight: "400",
  fontSize: "0.8333rem",
  cursor: "pointer",
  backgroundColor: "$secondary",
  width: "calc(100% - 1rem)",

  "> span": {
    whiteSpace: "nowrap",
    textOverflow: "ellipsis",
    overflow: "hidden",
  },

  '&[data-state="checked"]': {
    fontWeight: "700",
    color: "$primary !important",
  },

  "&:hover": {
    color: "$accent",
  },

  img: {
    width: "31px",
    height: "31px",
    marginRight: "0.5rem",
    borderRadius: "3px",
  },
});

const StyledSelectLabel = styled(Select.Label, {
  color: "$primaryMuted",
  fontFamily: "inherit",
  fontSize: "0.85rem",
  padding: "0.5rem 1rem 0.5rem 0.5rem",
  display: "flex",
  alignItems: "center",
  marginBottom: "0.25rem",
  borderRadius: "3px",
  borderTopLeftRadius: "0",
  borderBottomLeftRadius: "0",
  borderBottomRightRadius: "0",
  backgroundColor: "$secondaryMuted",
});

const StyledSelect = styled(Select.Root, {
  position: "relative",
  zIndex: "5",
  width: "100%",
});

export {
  StyledSelectButton,
  StyledSelectContent,
  StyledSelectItem,
  StyledSelectLabel,
  StyledSelectIcon,
  StyledSelect,
};
