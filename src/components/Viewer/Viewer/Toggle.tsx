import {
  StyledSwitch,
  StyledThumb,
  StyledToggle,
} from "src/components/Viewer/Viewer/Toggle.styled";
import { useViewerDispatch, useViewerState } from "src/context/viewer-context";

import React from "react";
import { useTranslation } from "react-i18next";

const Toggle = () => {
  const { isInformationOpen } = useViewerState();
  const dispatch: any = useViewerDispatch();

  const { t } = useTranslation();

  const handleOnCheckedChange = (checked) => {
    dispatch({
      type: "updateInformationOpen",
      isInformationOpen: checked,
    });
  };

  return (
    <StyledToggle>
      <StyledSwitch
        checked={isInformationOpen}
        onCheckedChange={handleOnCheckedChange}
        id="information-toggle"
        aria-label={t("informationPanelToggle")}
        name="toggled?"
      >
        <StyledThumb>
          <span>i</span>
        </StyledThumb>
      </StyledSwitch>
    </StyledToggle>
  );
};

export default React.memo(Toggle);
