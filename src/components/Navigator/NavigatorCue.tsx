import { useViewerDispatch } from "context/viewer-context";
import React from "react";
import { cleanTime } from "services/utils";
import { NavigatorCueAnchor } from "./NavigatorCue.styled";

interface Props {
  label: string;
  startTime: string;
  active: boolean;
  time: number;
}

const NavigatorCue: React.FC<Props> = ({ label, startTime, active, time }) => {
  const dispatch: any = useViewerDispatch();

  const handleClick = () => {
    dispatch({
      type: "updateTime",
      time: time,
    });
  };

  return (
    <NavigatorCueAnchor
      onClick={handleClick}
      aria-selected={active}
      data-testid="navigator-cue"
    >
      {label}
      <strong>{cleanTime(startTime)}</strong>
    </NavigatorCueAnchor>
  );
};

export default NavigatorCue;
