import "@radix-ui/themes/styles.css";

import { parseImageBody, parseSrc } from "src/lib/openseadragon-helpers";

import { ErrorBoundary } from "react-error-boundary";
import ErrorFallback from "src/components/UI/ErrorFallback/ErrorFallback";
import { InternationalString } from "@iiif/presentation-3";
import { LabeledIIIFExternalWebResource } from "src/types/presentation-3";
import OSD from "src/components/Image/OSD/OSD";
import { Options } from "openseadragon";
import React from "react";
import { Theme } from "@radix-ui/themes";
import defaultOpenSeadragonConfig from "src/components/Image/OSD/defaults";
import { getLabelAsString } from "src/lib/label-helpers";
import { globalCloverImage } from "src/styles/components";
import { v4 as uuidv4 } from "uuid";

interface CloverImageProps {
  _cloverViewerHasPlaceholder?: boolean;
  body?: LabeledIIIFExternalWebResource;
  instanceId?: string;
  isTiledImage?: boolean;
  label?: InternationalString | string;
  src?: string;
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
  globalCloverImage();

  const instance = instanceId ? instanceId : uuidv4();
  const ariaLabel = typeof label === "string" ? label : getLabelAsString(label);
  const config = {
    ...defaultOpenSeadragonConfig(instance),
    ...openSeadragonConfig,
  };

  const { imageType, uri } = body
    ? parseImageBody(body)
    : parseSrc(src, isTiledImage);

  if (!uri) return null;

  return (
    <ErrorBoundary FallbackComponent={ErrorFallback}>
      <Theme className="clover-theme clover-theme--image">
        <OSD
          _cloverViewerHasPlaceholder={_cloverViewerHasPlaceholder}
          ariaLabel={ariaLabel}
          config={config}
          imageType={imageType}
          key={instance}
          uri={uri}
          openSeadragonCallback={openSeadragonCallback}
        />
      </Theme>
    </ErrorBoundary>
  );
};

export default CloverImage;
