import React, { useEffect, useState } from "react";
import { Label } from "../Label/Label";

interface Props {
  manifest: object;
}

export const Viewer: React.FC<Props> = ({ manifest }) => {
  return (
    <>
      <Label label={manifest.label} language="en" />
    </>
  );
};
