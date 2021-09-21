import React, { useEffect, useState } from "react";
import { styled } from "@stitches/react";

interface Props {
  index: number;
  label: string;
  thumbnailId: string;
}

const handleUpdate = (): any => {
  return;
};

const MediaItem: React.FC<Props> = ({ index, label, thumbnailId }) => {
  return (
    <MediaItemWrapper onClick={handleUpdate()}>
      <figure>
        <img src={thumbnailId} />
        <figcaption>{label}</figcaption>
      </figure>
    </MediaItemWrapper>
  );
};

const MediaItemWrapper = styled("a", {
  display: "flex",
  flexShrink: "0",
  width: "123px",
  height: "76px",
  margin: "0 1em 0 0",
  backgroundColor: "white",
  cursor: "pointer",

  "&:last-child": {
    margin: "0",
  },
});

export default MediaItem;
