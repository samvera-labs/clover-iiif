import React from "react";

export type CurrentTimeContextShape = {
  currentTime: number;
  startTime: number;
  updateStartTime: (t: number) => void;
  updateCurrentTime: (t: number) => void;
};

const defaultValue: CurrentTimeContextShape = {
  currentTime: 0,
  startTime: 0,
  updateStartTime: () => {},
  updateCurrentTime: () => {},
};
export const CurrentTimeContext = React.createContext(defaultValue);

export const CurrentTimeProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const [currentTime, setCurrentTime] = React.useState(
    defaultValue.currentTime,
  );
  const [startTime, setStartTime] = React.useState(0);
  const updateStartTime = (t: number) => setStartTime(t);
  const updateCurrentTime = (t: number) => setCurrentTime(t);

  return (
    <CurrentTimeContext.Provider
      value={{ currentTime, startTime, updateStartTime, updateCurrentTime }}
    >
      {children}
    </CurrentTimeContext.Provider>
  );
};
