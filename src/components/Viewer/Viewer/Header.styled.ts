import { Popover } from "src/components/UI";
import { StyledSelect } from "src/components/UI/Select/Select.styled";
import { styled } from "src/styles/stitches.config";

const IIIFBadgeButton = styled(Popover.Trigger, {
  width: "30px",
  padding: "5px",
});

const PopoverContent = styled(Popover.Content, {
  display: "flex",
  flexDirection: "column",
  fontSize: "0.8333rem",
  border: "none",
  boxShadow: "2px 2px 5px #0003",
  zIndex: "2",

  button: {
    display: "flex",
    textDecoration: "none",
    marginBottom: "0.5em",
    color: "$accentAlt",
    cursor: "pointer",
    background: "$secondary",
    border: "none",

    ["&:last-child"]: {
      marginBottom: "0",
    },
  },
});

const ManifestLabel = styled("span", {
  fontSize: "1.33rem",
  alignSelf: "flex-start",
  flexGrow: "0",
  flexShrink: "1",
  padding: "1rem",

  "@sm": {
    fontSize: "1rem",
  },

  "&.visually-hidden": {
    position: "absolute",
    width: "1px",
    height: "1px",
    padding: "0",
    margin: "-1px",
    overflow: "hidden",
    clip: "rect(0, 0, 0, 0)",
    whiteSpace: "nowrap",
    border: "0",
  },
});

const Header = styled("header", {
  display: "flex",
  backgroundColor: "transparent !important",
  justifyContent: "space-between",
  alignItems: "flex-start",
  width: "100%",

  [`> ${StyledSelect}`]: {
    flexGrow: "1",
    flexShrink: "0",
  },

  form: {
    flexGrow: "0",
    flexShrink: "1",
  },
});

const HeaderOptions = styled("div", {
  display: "flex",
  alignItems: "flex-end",
  justifyContent: "flex-end",
  padding: "1rem",
  flexShrink: "0",
  flexGrow: "1",
});

export {
  Header,
  HeaderOptions,
  IIIFBadgeButton,
  PopoverContent,
  ManifestLabel,
};
