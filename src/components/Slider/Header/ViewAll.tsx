import { Homepage } from "src/components/Primitives";
import React from "react";
import { styled } from "src/styles/stitches.config";
import { useCloverTranslation } from "src/i18n/useCloverTranslation";

const ViewAllStyled = styled(Homepage, {
  display: "flex",
  backgroundColor: "$accent",
  color: "$secondary",
  height: "2rem !important",
  padding: "0 $3",
  // Spaced by the header row's gap rather than its own left margin.
  margin: "0",
  borderRadius: "2rem",
  cursor: "pointer",
  boxSizing: "content-box !important",
  transition: "$all",
  justifyContent: "center",
  alignItems: "center",
  lineBreak: "none",
  whiteSpace: "nowrap",
  textDecoration: "none !important",
  fontSize: "0.8333rem",

  [`&:hover`]: {
    backgroundColor: "$accentAlt",
  },
});

const ViewAll = (props) => {
  const { t } = useCloverTranslation();

  return <ViewAllStyled {...props}>{t("commonViewAll")}</ViewAllStyled>;
};

export default ViewAll;
