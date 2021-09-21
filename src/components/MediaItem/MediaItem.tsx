import React, { useEffect, useState } from "react";
import { styled } from "@stitches/react";

interface Props {
  index: number;
  label: string;
  thumbnailId: string;
  active: boolean;
}

const handleUpdate = (): any => {
  return;
};

const sample: object = {
  label: "Croquet Scene - Winslow Homer (1866)",
  thumbnailId:
    "https://upload.wikimedia.org/wikipedia/commons/thumb/9/9e/Winslow_Homer_-_Croquet_Scene_-_Google_Art_Project.jpg/640px-Winslow_Homer_-_Croquet_Scene_-_Google_Art_Project.jpg",
};

const MediaItem: React.FC<Props> = ({ index, label, thumbnailId }) => {
  return (
    <MediaItemWrapper onClick={handleUpdate()}>
      <figure>
        <img src={sample.thumbnailId} />
        <figcaption>{sample.label}</figcaption>
      </figure>
    </MediaItemWrapper>
  );
};

const MediaItemWrapper = styled("a", {
  display: "flex",
  flexShrink: "0",
  margin: "0 1rem 0 0",
  cursor: "pointer",

  "&:last-child": {
    margin: "0",
  },

  "&.active": {
    backgroundColor: "black",
  },

  figure: {
    margin: "0",
    width: "199px",

    img: {
      width: "199px",
      height: "123px",
      objectFit: "cover",
    },
  },
});

export default MediaItem;
