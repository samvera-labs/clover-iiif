import React from "react";
import { Item } from "./Cue.styled";
import { convertTime } from "services/utils";
import { CurrentTimeContext } from "context/current-time-context";

interface Props {
  label: string;
  start: number;
  end: number;
}

const Cue: React.FC<Props> = ({ label, start, end }) => {
  const { currentTime, updateStartTime } = React.useContext(CurrentTimeContext);
  const isActive: boolean = start <= currentTime && currentTime < end;

  const handleClick = () => {
    updateStartTime(start);
  };

  return (
    <Item
      aria-checked={isActive}
      data-testid="navigator-cue"
      onClick={handleClick}
      value={label}
    >
      {label}
      <strong>{convertTime(start)}</strong>
    </Item>
  );
};

export default Cue;
