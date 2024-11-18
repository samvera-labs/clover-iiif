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
  fontSize: "0.9rem !important",
  color: "$secondaryAlt",
  margin: "0 0.5em",
});

const StyledSearchAnnotations = styled("div", {
  display: "flex",
  flexDirection: "column",

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
  background: "none",
  zIndex: "2",
  height: "2rem",
  justifyContent: "center",
  display: "flex",
  alignItems: "center",
  fontSize: "1rem",
  fontFamily: "inherit",
  outline: "none !important",
  border: "none !important",
  color: "$secondary",
  cursor: "pointer",
  boxSizing: "content-box !important",
  flexGrow: "0",
  width: "2rem",
});

const StyledSearchIcon = styled("span", {
  position: "absolute",
  zIndex: "3",
  width: "2rem",
  height: "2rem",
  padding: "8px",
  color: "$secondary !important",
  fill: "$secondary !important",
  stroke: "$secondary !important",
  transition: "$all",
  cursor: "pointer",

  svg: {
    color: "inherit",
    fill: "inherit",
    stroke: "inherit",
  },
});

const StyledSearchBackButton = styled("button", {
  opacity: "1",
  display: "flex",
  alignItems: "center",
  width: "1.25em",
  height: "1.25em",
  alignSelf: "center",
  margin: "0 0.25rem",
  fill: "$secondary",
  flexShrink: "0",

  svg: {
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
  transition: "$all",
  flexGrow: "1",

  variants: {
    isPanelExpanded: {
      true: {
        [`${StyledSearchIcon}`]: {
          marginLeft: "0",
          cursor: "text",
        },

        [`${StyledSearchInput}`]: {
          width: "100%",
          padding: "0 1rem 0 2rem",
          cursor: "text",
        },
      },
      false: {
        "&:hover": {
          backgroundColor: "$accent !important",
        },

        [`${StyledSearchIcon}`]: { cursor: "pointer" },

        [`${StyledSearchInput}`]: {
          cursor: "pointer",

          "&::placeholder": {
            color: "transparent !important",
          },
        },
      },
    },
  },
});

const StyledSearch = styled("div", {
  display: "flex",
  alignItems: "center",
  gap: "0.25rem",

  "&[data-active=true]": {
    paddingRight: "0.5rem",
  },

  button: {
    fontSize: "0.9em",
    fill: "$secondary",
    color: "$secondary",
    stroke: "$secondary",

    svg: {
      fill: "inherit",
      color: "inherit",
      stroke: "inherit",
      width: "1.25em",
    },
  },
});

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
