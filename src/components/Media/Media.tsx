import React, { useEffect, useState } from "react";
import { styled } from "@stitches/react"
import MediaItem from "components/MediaItem/MediaItem"

interface Props {
  items: object;
  activeItem: number;
}

const Media: React.FC<Props> = ({ items, activeItem }) => {
  return (
    <MediaWrapper>
      <MediaItem index={0} label="" thumbnailId="" active={false} />
      <MediaItem index={1} label="" thumbnailId="" active={true} />
      <MediaItem index={2} label="" thumbnailId="" active={false} />
      <MediaItem index={3} label="" thumbnailId="" active={false} />
      <MediaItem index={4} label="" thumbnailId="" active={false} />
      <MediaItem index={5} label="" thumbnailId="" active={false} />
      <MediaItem index={6} label="" thumbnailId="" active={false} />
      <MediaItem index={7} label="" thumbnailId="" active={false} />
      <MediaItem index={8} label="" thumbnailId="" active={false} />
    </MediaWrapper>
  );
};

const MediaWrapper = styled("nav", {
  display: "flex",
  flexDirection: "row",
  flexGrow: "1",
  padding: "1.618rem 0.618rem 1.618rem 0 ",
  overflowX: "scroll",
  backgroundColor: "white",
});

export default Media;
