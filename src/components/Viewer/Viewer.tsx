import React, { useEffect, useState } from "react";
import { label } from "../../services/IIIF/presentation";

interface Props {
  manifest: object;
}

export const Viewer: React.FC<Props> = ({ manifest }) => {
  return <>{label({ en: ["manifest.label"] }, "en")}</>;
};
