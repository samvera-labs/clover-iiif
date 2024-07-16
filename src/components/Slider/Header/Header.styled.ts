import { styled } from "src/styles/stitches.config";

const HeaderContent = styled("div", {
  display: "flex",
  flexDirection: "column",
  gap: "var(--space-2)",
  flexShrink: 1,
});

const HeaderControls = styled("div", {
  display: "flex",
  gap: "var(--space-2)",
  flexShrink: 0,

  button: {
    cursor: "pointer",

    svg: {
      width: "18px",
      height: "18px",
    },
  },
});

const HeaderStyled = styled("div", {
  display: "flex",
  justifyContent: "space-between",
  alignItems: "flex-end",
  paddingBottom: "var(--space-5)",
  gap: "var(--space-7)",

  "@xs": {
    flexDirection: "column",
  },
});

export { HeaderContent, HeaderControls, HeaderStyled };
