import React from "react";
import { styled } from "@stitches/react";
import MediaItem from "components/Media/MediaItem";
import { useVaultState } from "context/vault-context";
import { CanvasNormalized } from "@hyperion-framework/types";

interface MediaProps {
  items: object[];
  activeItem: number;
}

const Media: React.FC<MediaProps> = ({ items, activeItem }) => {
  const state = useVaultState();
  const { vault } = state;

  return (
    <MediaWrapper>
      <>
        {items.map((item: object, key: number) => {
          const canvas: CanvasNormalized = vault.fromRef(item);
          return <MediaItem index={key} canvas={canvas} active={true} />;
        })}
      </>
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
