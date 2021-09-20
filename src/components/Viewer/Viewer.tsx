import React, { useEffect, useState } from "react";

interface Props {
  manifest: string;
}

export const Viewer: React.FC<Props> = ({ manifest }) => {
  return <>{manifest}</>;
};
