import * as Switch from "@radix-ui/react-switch";
import { useViewerDispatch, useViewerState } from "src/context/viewer-context";

import React from "react";
import { useCloverTranslation } from "src/i18n/useCloverTranslation";
import {
  toggleForm,
  toggleSwitch,
  toggleThumb,
  toggleThumbLabel,
} from "./Toggle.css";

const Toggle = () => {
  const { isInformationOpen } = useViewerState();
  const dispatch: any = useViewerDispatch();

  const { t } = useCloverTranslation();

  const handleOnCheckedChange = (checked) => {
    dispatch({
      type: "updateInformationOpen",
      isInformationOpen: checked,
    });
  };

  return (
    <form className={toggleForm}>
      <Switch.Root
        checked={isInformationOpen}
        onCheckedChange={handleOnCheckedChange}
        id="information-toggle"
        aria-label={t("informationPanelToggle")}
        className={toggleSwitch}
      >
        <Switch.Thumb className={toggleThumb}>
          <span className={toggleThumbLabel}>i</span>
        </Switch.Thumb>
      </Switch.Root>
    </form>
  );
};

export default React.memo(Toggle);
