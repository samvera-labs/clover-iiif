import { Homepage } from "src/components/Primitives";
import React from "react";
import { PrimitivesHomepage } from "src/types/primitives";
import { sliderViewAll } from "./Header.css";
import { useCloverTranslation } from "src/i18n/useCloverTranslation";

type ViewAllProps = PrimitivesHomepage;

const ViewAll: React.FC<ViewAllProps> = ({ className, ...props }) => {
  const { t } = useCloverTranslation();

  return (
    <Homepage
      {...props}
      className={[sliderViewAll, className].filter(Boolean).join(" ")}
    >
      {t("commonViewAll")}
    </Homepage>
  );
};

export default ViewAll;
