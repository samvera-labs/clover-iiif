import React, { useEffect, useState } from "react";

interface Props {
  source: string;
  poster: string;
  tracks: object;
}

export const Media: React.FC<Props> = ({ source }) => {
  return <>{source}</>;
};
