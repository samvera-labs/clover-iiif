import React, { useEffect, useState } from "react";

interface Props {
  currentTime: number;
  tracks: object;
}

export const Navigator: React.FC<Props> = ({ currentTime }) => {
  return <>{currentTime}</>;
};
