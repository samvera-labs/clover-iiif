import React from "react";
import { useViewerDispatch } from "context/viewer-context";
import { Item } from "./Cue.styled";

import { cleanTime } from "services/utils";

interface Props {
  label: string;
  startTime: string;
  isActive: boolean;
  time: number;
}

const Cue: React.FC<Props> = ({ label, startTime, isActive, time }) => {
  const dispatch: any = useViewerDispatch();

  const handleClick = () => {
    dispatch({
      type: "updateTime",
      time: time,
    });
  };

  return (
    <Item
      aria-checked={isActive}
      data-testid="navigator-cue"
      onClick={handleClick}
      value={label}
    >
      {label}
      <strong>{cleanTime(startTime)}</strong>
    </Item>
  );
};

export default Cue;
