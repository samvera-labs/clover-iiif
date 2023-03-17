import { styled } from "@/stitches";

const Wrapper = styled("div", {
  position: "absolute",
  zIndex: "1",
  top: "1rem",
  right: "3.618rem",
  display: "flex",

  "@xs": {
    flexDirection: "column",
    zIndex: "2",
    top: "3.618rem",
    right: "1rem",
  },
});

export { Wrapper };
