import React from "react";

import type { IIIFCanvas } from "src/components/Canvas/layout";
import Metadata from "src/components/Primitives/Metadata/Metadata";
import Summary from "src/components/Primitives/Summary/Summary";

/**
 * A Canvas's `summary` and `metadata`, rendered by the Primitives: IIIF's limited HTML is
 * kept, everything else is sanitised away. Lazy, through `Caption`.
 */
const CaptionDetails: React.FC<Pick<IIIFCanvas, "summary" | "metadata">> = ({
  summary,
  metadata,
}) => (
  <>
    {Boolean(summary) && (
      <Summary
        as="p"
        className="clover-canvas-caption-summary"
        summary={summary as any}
      />
    )}
    {Boolean(metadata?.length) && (
      <Metadata
        className="clover-canvas-caption-metadata"
        metadata={metadata as any}
      />
    )}
  </>
);

export default CaptionDetails;
