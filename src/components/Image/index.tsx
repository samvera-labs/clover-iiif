import { parseImageBody, parseSrc } from "src/lib/openseadragon-helpers";

import { ErrorBoundary } from "react-error-boundary";
import ErrorFallback from "src/components/UI/ErrorFallback/ErrorFallback";
import { InternationalString } from "@iiif/presentation-3";
import { LabeledIIIFExternalWebResource } from "src/types/presentation-3";
import OSD from "src/components/Image/OSD/OSD";
import { OpenSeadragonImageTypes } from "src/types/open-seadragon";
import { Options } from "openseadragon";
import React from "react";
import defaultOpenSeadragonConfig from "src/components/Image/OSD/defaults";
import { getLabelAsString } from "src/lib/label-helpers";
import { v4 as uuidv4 } from "uuid";

interface CloverImageProps {
  _cloverViewerHasPlaceholder?: boolean;
  body?: LabeledIIIFExternalWebResource | LabeledIIIFExternalWebResource[];
  instanceId?: string;
  isTiledImage?: boolean;
  label?: InternationalString | string;
  src?: string | string[];
  openSeadragonCallback?: (viewer: any) => void;
  openSeadragonConfig?: Options;
}

const CloverImage: React.FC<CloverImageProps> = ({
  _cloverViewerHasPlaceholder = false,
  body,
  instanceId,
  isTiledImage = false,
  label,
  src = "",
  openSeadragonCallback,
  openSeadragonConfig = {},
}) => {
  const instance = instanceId ?? uuidv4();
  const ariaLabel = typeof label === "string" ? label : getLabelAsString(label);
  const config = {
    ...defaultOpenSeadragonConfig(instance),
    ...openSeadragonConfig,
  };

  const normalizedBody = Array.isArray(body) ? body : body ? [body] : [];
  const normalizedSrc = Array.isArray(src) ? src : src ? [src] : [];

  let uri: string[] = [];
  let imageType: OpenSeadragonImageTypes = OpenSeadragonImageTypes.SimpleImage;

  if (normalizedBody.length) {
    const parsed = normalizedBody.map(parseImageBody);
    // @ts-ignore
    uri = parsed.map((p) => p.uri).filter(Boolean);
    imageType = parsed.some(
      (p) => p.imageType === OpenSeadragonImageTypes.TiledImage,
    )
      ? OpenSeadragonImageTypes.TiledImage
      : OpenSeadragonImageTypes.SimpleImage;
  } else if (normalizedSrc.length) {
    const parsed = normalizedSrc.map((s) => parseSrc(s, isTiledImage));
    uri = parsed.map((p) => p.uri).filter(Boolean);
    imageType = parsed.some(
      (p) => p.imageType === OpenSeadragonImageTypes.TiledImage,
    )
      ? OpenSeadragonImageTypes.TiledImage
      : OpenSeadragonImageTypes.SimpleImage;
  }

  if (!uri.length) return null;

  return (
    <ErrorBoundary FallbackComponent={ErrorFallback}>
      <OSD
        _cloverViewerHasPlaceholder={_cloverViewerHasPlaceholder}
        ariaLabel={ariaLabel}
        config={config}
        imageType={imageType}
        key={instance}
        uri={uri}
        openSeadragonCallback={openSeadragonCallback}
      />
    </ErrorBoundary>
  );
};

export default CloverImage;
