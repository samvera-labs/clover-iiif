import React, { useEffect, useState } from "react";
import { label } from "../../services/IIIF/presentation";
import { Media } from "../Media/Media";
import { Navigator } from "../Navigator/Navigator";
import { Video } from "../Video/Video";

interface Props {
  manifest: object;
}

export const Viewer: React.FC<Props> = ({ manifest }) => {
  return (
    <>
      <header>{label({ en: ["manifest.label"] }, "en")}</header>
      <div>
        <Video source="https://video.source..." poster="" tracks={{}} />
        <Navigator currentTime={0} tracks={{}} />
        <Media items={{}} activeItem={0} />
      </div>
    </>
  );
};
