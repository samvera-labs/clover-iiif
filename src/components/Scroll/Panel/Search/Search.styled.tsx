import { styled } from "src/styles/stitches.config";

const highlightColor = "255, 197, 32"; // #FFC520

const StyledSearchTag = styled("span", {
  fontWeight: "700",
});

const StyledSearchAnnotationInformation = styled("div", {
  display: "flex",
  gap: "0.25rem",
});

const StyledSearchAnnotationsResultsLabel = styled("div", {
  fontSize: "0.9rem",
  padding: "1rem 0.618rem",
});

const StyledSearchAnnotations = styled("div", {
  display: "flex",
  flexDirection: "column",
  gap: "0.5rem",

  hr: {
    margin: "0.618rem",
    border: "none",
    borderBottom: "1px solid #6662",
  },

  button: {
    backgroundColor: "#6660",
    opacity: "0.7",
    transition: "$all",
    padding: "0.5rem 0.618rem",
    fontSize: "0.9rem",
    lineHeight: "1.1rem",
    textAlign: "left",
    borderRadius: "6px",
    border: "1px solid #6662",
    display: "flex",
    flexDirection: "column",
    gap: "0.25rem",

    "&:hover": {
      opacity: "1",
      boxShadow: "5px 5px 13px #6662",
    },

    "&[data-result=true]": {
      backgroundColor: `rgba(${highlightColor}, 0.2)`,
      borderColor: `rgba(${highlightColor}, 0.2)`,
      opacity: "1",

      "&:hover": {
        backgroundColor: `rgba(${highlightColor}, 0.2)`,
      },
    },
  },
});

const StyledSearchInput = styled("input", {
  margin: "0",
  padding: "0 1rem 0 2rem",
  background: "none",
  zIndex: "2",
  height: "2rem",
  marginLeft: "1rem",
  marginTop: "1rem",
  justifyContent: "center",
  display: "flex",
  alignItems: "center",
  fontSize: "1rem",
  borderRadius: "2rem",
  fontFamily: "inherit",
  backgroundColor: "$primary",
  border: "none",
  color: "$secondary",
  cursor: "text",
  filter: "drop-shadow(2px 2px 5px #0003)",
  transition: "$all",
  boxSizing: "content-box !important",
  flexGrow: "0",
  width: "100%",

  "&:placeholder": {
    color: "inherit",
  },
});

const StyledSearchIcon = styled("span", {
  position: "absolute",
  zIndex: "3",
  width: "2rem",
  height: "2rem",
  padding: "8px",
  marginTop: "1rem",
  marginLeft: "1rem",
  color: "$secondary",
  fill: "$secondary",
  stroke: "$secondary",
  transition: "$all",
  cursor: "text",
});

const StyledSearchBackButton = styled("button", {
  opacity: "1",
  display: "flex",
  alignItems: "center",
  borderRadius: "2rem",
  width: "2rem",
  height: "2rem",
  alignSelf: "center",
  marginTop: "1rem",
  gap: "0.35rem",
  backgroundColor: "$accent",
  fill: "$secondary",
  flexShrink: "0",

  svg: {
    padding: "6px",
    color: "inherit",
    fill: "inherit",
  },

  '&[aria-disabled="true"]': {
    opacity: "0",
    display: "none",
  },
});

const StyledSearchForm = styled("form", {
  display: "flex",
  justifyContent: "space-between",
  gap: "1rem",
  width: "100%",

  variants: {
    isPanelExpanded: {
      true: {
        [`${StyledSearchIcon}`]: {
          marginLeft: "0",
        },

        [`& ${StyledSearchInput}`]: {
          marginLeft: "0",
          backgroundColor: "$primary",
          width: "auto",
          flexGrow: "1",
          //
        },
      },
      false: {
        //
      },
    },
  },
});

const StyledSearch = styled("div", {});

export {
  StyledSearch,
  StyledSearchAnnotations,
  StyledSearchAnnotationsResultsLabel,
  StyledSearchAnnotationInformation,
  StyledSearchBackButton,
  StyledSearchForm,
  StyledSearchIcon,
  StyledSearchInput,
  StyledSearchTag,
};
