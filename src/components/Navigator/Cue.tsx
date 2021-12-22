import React from "react";
import { useViewerDispatch } from "context/viewer-context";
import { Item } from "./Cue.styled";
import { convertTime } from "services/utils";

interface Props {
  label: string;
  isActive: boolean;
  isChild?: boolean;
  time: number;
}

const Cue: React.FC<Props> = ({ label, isActive, isChild, time }) => {
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
      isChild={isChild}
    >
      {label}
      <strong>{convertTime(time)}</strong>
    </Item>
  );
};

export default Cue;
