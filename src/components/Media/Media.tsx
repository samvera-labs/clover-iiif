import React, { useEffect, useState } from "react";

interface Props {
  poster: string;
  source: string;
  tracks: object;
}

export const Media: React.FC<Props> = ({ source }) => {
  return <>{source}</>;
};
