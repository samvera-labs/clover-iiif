import React from "react";

import type { IIIFCanvas } from "./layout";
import { Markup, MetadataList } from "../../ui/Markup";

/**
 * A Canvas's `summary` and `metadata`: IIIF's limited HTML is kept, everything else is
 * sanitised away. Lazy, through `Caption`, so the sanitiser loads only when it opens.
 */
const CaptionDetails: React.FC<Pick<IIIFCanvas, "summary" | "metadata">> = ({
  summary,
  metadata,
}) => (
  <>
    <Markup
      as="p"
      className="clover-canvas-caption-summary"
      markup={summary as any}
    />
    <MetadataList
      className="clover-canvas-caption-metadata"
      metadata={metadata as any}
    />
  </>
);

export default CaptionDetails;
