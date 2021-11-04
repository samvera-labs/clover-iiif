import { styled } from "stitches";

const NavigatorTabButton = styled("button", {
  display: "flex",
  position: "relative",
  padding: "0.6rem 1rem 0.5rem",
  background: "none",
  backgroundColor: "transparent",
  color: "$primaryMuted",
  border: "none",
  fontFamily: "inherit",
  fontSize: "1rem",
  marginRight: "1rem",
  lineHeight: "1rem",
  whiteSpace: "nowrap",
  cursor: "pointer",
  fontWeight: 700,
  transition: "$all",

  "&::after": {
    width: "0",
    height: "4px",
    content: "",
    backgroundColor: "$primaryMuted",
    position: "absolute",
    bottom: "-4px",
    left: "0",
    transition: "$all",
  },

  "&:hover": {
    color: "$primary",
  },

  "&[data-active=true]": {
    color: "$accent",

    "&::after": {
      width: "100%",
      backgroundColor: "$accent",
    },
  },
});

export { NavigatorTabButton };
