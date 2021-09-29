import React from "react";
import { styled } from "@stitches/react";
import MediaItem from "components/Media/MediaItem";
import { useVaultState } from "context/vault-context";
import {
  CanvasNormalized,
  AnnotationPageNormalized,
  AnnotationNormalized,
  ContentResource,
} from "@hyperion-framework/types";

interface MediaProps {
  items: object[];
  activeItem: number;
}

const Media: React.FC<MediaProps> = ({ items, activeItem }) => {
  const state: any = useVaultState();
  const { activeCanvas, vault } = state;

  const annotationMotivation = "painting";
  const contentResourceType = ["Sound", "Video"];

  console.log(activeCanvas);

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
          if (annotation.motivation.includes(annotationMotivation)) {
            // 5.get contentResource (the annotation body)
            const contentResource: ContentResource = vault.fromRef(
              annotation.body[0],
            );
            // 6. render media item if annotation target matches original
            //    canvas ID and contentResource type is Sound or Video
            if (
              annotation.target === item.id &&
              contentResourceType.includes(contentResource.type)
            )
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
