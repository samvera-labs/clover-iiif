import React, { useEffect, useState } from "react";
import { styled } from "@stitches/react";
import MediaItem from "components/MediaItem/MediaItem";

interface Props {
  items: object;
  activeItem: number;
}

const Media: React.FC<Props> = ({ items, activeItem }) => {
  return (
    <MediaWrapper>
      <MediaItem index={0} label="" thumbnailId="" />
      <MediaItem index={1} label="" thumbnailId="" />
      <MediaItem index={2} label="" thumbnailId="" />
      <MediaItem index={3} label="" thumbnailId="" />
      <MediaItem index={4} label="" thumbnailId="" />
      <MediaItem index={5} label="" thumbnailId="" />
      <MediaItem index={6} label="" thumbnailId="" />
      <MediaItem index={7} label="" thumbnailId="" />
      <MediaItem index={8} label="" thumbnailId="" />
    </MediaWrapper>
  );
};

const MediaWrapper = styled("div", {
  display: "flex",
  flexDirection: "row",
  flexGrow: "1",
  padding: "1.618rem",
  overflowX: "scroll",
  backgroundColor: "lightPink",
});

export default Media;
