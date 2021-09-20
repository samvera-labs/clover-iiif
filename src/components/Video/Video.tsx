import React, { useEffect, useState } from "react";

interface Props {
  poster: string;
  source: string;
  tracks: object;
}

export const Video: React.FC<Props> = ({ source }) => {
  return <video src={source}></video>;
};
