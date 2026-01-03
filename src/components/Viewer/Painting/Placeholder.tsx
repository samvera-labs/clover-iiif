import React, { useEffect, useState } from "react";
import { getLabel, getPaintingResource } from "src/hooks/use-iiif";

import { InternationalString } from "@iiif/presentation-3";
import { PlaceholderStyled } from "./Placeholder.styled";
import { useViewerState } from "src/context/viewer-context";

/**
 * Note: The items array passed to this component is already ordered
 * correctly for RTL paged content by the parent Painting component.
 */

interface Props {
  isActive: boolean;
  isMedia: boolean;
  items: Array<{
    id: string;
    label: InternationalString | null;
  }>;
  setIsInteractive: (arg0: boolean) => void;
}

const PaintingPlaceholder: React.FC<Props> = ({
  isActive,
  isMedia,
  items,
  setIsInteractive,
}) => {
  const { vault } = useViewerState();

  const [images, setImages] = useState<
    Array<{
      src?: string;
      alt: string;
      width: number;
      height: number;
    }>
  >([]);

  const isPaged = images.length > 1;

  useEffect(() => {
    setImages([]);
    const placeholders = items
      .map((item) => {
        const annotations = getPaintingResource(vault, item.id);

        if (!annotations) return null;

        const { id, width, height } = annotations[0];

        if (!id) return null;

        return {
          src: id,
          width: width || 640,
          height: height || 640,
          alt: item.label
            ? (getLabel(item.label) as string)
            : "placeholder image",
        };
      })
      .filter((item) => item !== null);

    if (!placeholders.length) return;

    setImages(placeholders);
  }, [items, isPaged]);

  if (!isActive || !images.length) return null;

  // Calculate the scaled width of each image based on its aspect ratio
  const scaledWidths = images.map((img) => (img.width / img.height) * 1);
  const totalScaledWidth = scaledWidths.reduce((a, b) => a + b, 0);

  return (
    <PlaceholderStyled
      onClick={() => setIsInteractive(true)}
      isMedia={isMedia}
      className="clover-viewer-placeholder"
      data-active={isActive}
      data-paged={isPaged}
    >
      {images.map((placeholder, index) => {
        const percentWidth = (scaledWidths[index] / totalScaledWidth) * 100;
        return (
          <img
            {...placeholder}
            key={index}
            alt={placeholder.alt}
            style={{
              width: `${percentWidth}%`,
            }}
          />
        );
      })}
    </PlaceholderStyled>
  );
};

export default PaintingPlaceholder;
