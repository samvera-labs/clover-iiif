import React, { useEffect, useState } from "react";
import { label } from "../../services/IIIF/presentation";
import { Media } from "../Media/Media";
import { Navigator } from "../Navigator/Navigator";

interface Props {
  manifest: object;
}

export const Viewer: React.FC<Props> = ({ manifest }) => {
  return (
    <>
      {label({ en: ["manifest.label"] }, "en")}
      <div>
        <Media source="https://video.source..." poster="" tracks={{}} />
        <Navigator currentTime={0} tracks={{}} />
      </div>
    </>
  );
};
