import { styled } from "@/stitches";
import { Popover } from "@nulib/design-system";
import { CollectionStyled } from "@/components/Collection/Collection.styled";

const IIIFBadgeButton = styled(Popover.Trigger, {
  width: "30px",
  padding: "5px",
  margin: "0 0 0 2rem",
});

const IIIFBadgeContent = styled(Popover.Content, {
  display: "flex",
  flexDirection: "column",
  fontSize: "0.8333rem",
  border: "none",
  boxShadow: "2px 2px 5px #0003",
  marginRight: "1rem",
  zIndex: "2",

  button: {
    display: "flex",
    textDecoration: "none",
    fontFamily: "$sans",
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
  fontSize: "1.25rem",
  fontWeight: "700",
  fontFamily: "$display",
  alignSelf: "flex-start",
  flexGrow: "1",
  flexShrink: "0",

  "@sm": {
    fontSize: "1rem",
  },
});

const Header = styled("header", {
  display: "flex",
  backgroundColor: "transparent !important",
  justifyContent: "flex-end",
  padding: "1rem",

  [`> ${CollectionStyled}`]: {
    flexGrow: "1",
    flexShrink: "0",
  },

  form: {
    flexGrow: "0",
    flexShrink: "1",
  },
});

export { Header, IIIFBadgeButton, IIIFBadgeContent, ManifestLabel };
