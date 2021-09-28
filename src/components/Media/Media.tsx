import React from "react";
import { styled } from "@stitches/react";
import MediaItem from "components/Media/MediaItem";
import { useVaultState } from "context/vault-context";
import {
  CanvasNormalized,
  ManifestNormalized,
  Annotation,
  AnnotationPageNormalized,
  AnnotationNormalized,
  ContentResource,
} from "@hyperion-framework/types";

interface MediaProps {
  items: object[];
  manifest: ManifestNormalized;
  activeItem: number;
}

const Media: React.FC<MediaProps> = ({ items, manifest, activeItem }) => {
  const state: any = useVaultState();
  const { vault } = state;
  const contentResourceType = ["Sound", "Video"];

  return (
    <MediaWrapper>
      {items.map((item: object, key: number) => {
        // 1. get canvas
        const canvas: CanvasNormalized = vault.fromRef(item);
        // 2. get annotationPage
        const annotationPage: AnnotationPageNormalized = vault.fromRef(
          canvas.items[0],
        );
        // 3.get annotations
        const annotations: Array<AnnotationNormalized> = vault.allFromRef(
          annotationPage.items,
        );

        // 4.determine if W3C annotation is motivation painting
        for (const annotation of annotations) {
          if (annotation.motivation[0] === "painting") {
            // 5.determine if Video or Sound
            const contentResource: ContentResource = vault.fromRef(
              annotation.body[0],
            );
            if (contentResourceType.includes(contentResource.type))
              return <MediaItem key={key} canvas={canvas} active={true} />;
          }
        }
      })}
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
