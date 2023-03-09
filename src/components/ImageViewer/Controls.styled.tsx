import { styled } from "@/stitches";

const Wrapper = styled("div", {
  position: "absolute",
  zIndex: "1",
  top: "1rem",
  right: "1rem",
  display: "flex",

  "@xs": {
    flexDirection: "column",
    zIndex: "2",
  },
});

export { Wrapper };
