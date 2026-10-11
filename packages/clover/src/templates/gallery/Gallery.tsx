import React, { useState } from "react";

import * as Clover from "../../parts";
import type { RootProps } from "../../parts";
import { Lightbox } from "../shared/Lightbox";

export type GalleryProps = Omit<RootProps, "children"> & {
  /** The size of a grid cell. Default `10rem`, through `--clover-items-size`. */
  size?: string;
};

/**
 * A grid of the Manifest's views — a spread is one cell — that opens one in a lightbox
 * with the stage and the pager. Escape, the close button, or a press outside closes it,
 * and focus returns to the cell.
 */
export function Gallery({ className, size, style, ...root }: GalleryProps) {
  const [open, setOpen] = useState(false);
  return (
    <Clover.Root
      className={["clover-template-gallery", className]
        .filter(Boolean)
        .join(" ")}
      style={
        size
          ? ({ ...style, "--clover-items-size": size } as React.CSSProperties)
          : style
      }
      {...root}
    >
      <header className="clover-template-gallery-header">
        <Clover.Label as="h2" className="clover-template-gallery-title" />
        <Clover.Summary className="clover-template-gallery-summary" />
      </header>
      <Clover.Status />
      <Clover.Items layout="grid" onSelect={() => setOpen(true)} />
      <Lightbox open={open} onClose={() => setOpen(false)} />
    </Clover.Root>
  );
}
