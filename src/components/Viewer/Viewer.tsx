import React, { useEffect, useState } from "react";
import { Media } from "../Media/Media";
import { Navigator } from "../Navigator/Navigator";
import { Video } from "../Video/Video";
import { label } from "../../services/IIIF/presentation";

interface Props {
  manifest: object;
}

export const Viewer: React.FC<Props> = ({ manifest }) => {
  return (
    <>
      <header>{label({ en: ["manifest.label"] }, "en")}</header>
      <div>
        <Video source="uri" poster="uri" tracks={{}} />
        <Navigator currentTime={0} tracks={{}} />
        <Media items={{}} activeItem={0} />
      </div>
    </>
  );
};
