import { Homepage } from "src/components/Primitives";
import React from "react";
import { useCloverTranslation } from "src/i18n/useCloverTranslation";

const ViewAll = (props) => {
  const { t } = useCloverTranslation();

  return <Homepage {...props}>{t("commonViewAll")}</Homepage>;
};

export default ViewAll;
