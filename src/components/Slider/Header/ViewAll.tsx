import { Homepage } from "src/components/Primitives";
import React from "react";
import { styled } from "src/styles/stitches.config";
import { useTranslation } from "react-i18next";

const ViewAllStyled = styled(Homepage, {
  display: "flex",
  backgroundColor: "$accent",
  color: "$secondary",
  height: "2rem !important",
  padding: "0 $3",
  margin: "0 0 0 $3",
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
    boxShadow: "3px 3px 11px #0003",

    [`&:disabled`]: {
      boxShadow: "unset",
    },
  },
});

const ViewAll = (props) => {
  const { t } = useTranslation();

  return <ViewAllStyled {...props}>{t("commonViewAll")}</ViewAllStyled>;
};

export default ViewAll;
