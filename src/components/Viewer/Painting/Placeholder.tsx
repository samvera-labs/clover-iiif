import {
  IIIFExternalWebResource,
  InternationalString,
} from "@iiif/presentation-3";
import React, { useEffect, useState } from "react";
import { getLabel, getPaintingResource } from "src/hooks/use-iiif";

import { PlaceholderStyled } from "./Placeholder.styled";
import { useViewerState } from "src/context/viewer-context";

interface Props {
  isMedia: boolean;
  items: Array<{
    id: string;
    label: InternationalString | null;
  }>;
  setIsInteractive: (arg0: boolean) => void;
}

const PaintingPlaceholder: React.FC<Props> = ({
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
    const placeholders = items
      .map((item) => {
        const annotations = getPaintingResource(vault, item.id);

        if (!annotations) return null;

        const { id, width, height } = annotations[0];

        if (!id) return null;

        return {
          src: id,
          width: width || 500,
          height: height || 500,
          alt: item.label
            ? (getLabel(item.label) as string)
            : "placeholder image",
        };
      })
      .filter((item) => item !== null);

    if (!placeholders.length) return;

    setImages(placeholders);
  }, [items, isPaged]);

  return (
    <PlaceholderStyled
      onClick={() => setIsInteractive(true)}
      isMedia={isMedia}
      className="clover-viewer-placeholder"
      data-is-paged={isPaged}
    >
      {images.map((placeholder, index) => (
        <img {...placeholder} key={index} alt={placeholder.alt} />
      ))}
    </PlaceholderStyled>
  );
};

export default PaintingPlaceholder;
