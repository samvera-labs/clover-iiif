import React from "react";
import { styled } from "@stitches/react";
import MediaItem from "components/MediaItem/MediaItem";
import { useVaultState } from "context/vault-context";

const sampleManifest: string =
  "https://raw.githubusercontent.com/mathewjordan/mirador-playground/main/assets/iiif/manifest/new_airliner_invalid.json";

const Media: React.FC = () => {
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
