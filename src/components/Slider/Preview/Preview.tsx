import * as AspectRatio from "@radix-ui/react-aspect-ratio";

import React, { useEffect, useState } from "react";
import {
  preview,
  previewControls,
  previewLabel,
  previewOverlay,
  previewVisible,
} from "./Preview.css";

import { Manifest } from "@iiif/presentation-3";
import { NextIcon } from "src/components/Slider/Icons/NextIcon";
import { PreviousIcon } from "src/components/Slider/Icons/PrevIcon";

interface PreviewProps {
  activeCanvas: number;
  handleActiveCanvas: (e: React.MouseEvent) => void;
  isFocused: boolean;
  manifest: Manifest;
}

const Preview: React.FC<PreviewProps> = ({
  activeCanvas,
  handleActiveCanvas,
  isFocused,
  manifest,
}) => {
  const [hasPrev, setHasPrev] = useState<boolean>(false);
  const [hasNext, setHasNext] = useState<boolean>(false);

  const canvasCurrent: number = activeCanvas + 1;
  let canvasCount: number = 0;

  if (manifest) canvasCount = manifest.items.length;

  useEffect(() => {
    canvasCurrent <= 1 ? setHasPrev(false) : setHasPrev(true);
    canvasCurrent >= canvasCount ? setHasNext(false) : setHasNext(true);
  }, [activeCanvas, canvasCount, canvasCurrent, manifest]);

  return (
    <div
      className={[preview, isFocused ? previewVisible : null]
        .filter(Boolean)
        .join(" ")}
    >
      <AspectRatio.Root ratio={1 / 1}>
        {manifest && (
          <div className={previewOverlay}>
            <div
              className={previewControls}
              onClick={(e) => e.preventDefault()}
            >
              <button
                // @ts-ignore
                onClick={() => handleActiveCanvas(-1)}
                disabled={!hasPrev}
              >
                <PreviousIcon />
              </button>

              <button
                onClick={
                  // @ts-ignore
                  () => handleActiveCanvas(1)
                }
                disabled={!hasNext}
              >
                <NextIcon />
              </button>
            </div>
            <div className={previewLabel} onClick={(e) => e.preventDefault()}>
              {canvasCurrent} of {canvasCount}
            </div>
          </div>
        )}
      </AspectRatio.Root>
    </div>
  );
};

export default Preview;
