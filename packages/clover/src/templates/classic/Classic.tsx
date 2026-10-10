import React, { useId, useState } from "react";

import * as Clover from "../../index";
import type { RootProps } from "../../index";

export type ClassicProps = Omit<RootProps, "children"> & {
  /** The information panel beside the stage, with its toggle. Default `true`. */
  panel?: boolean;
  /** Whether the panel starts open. Default `true`. */
  defaultPanelOpen?: boolean;
  /** A Share button in the header. Default `true`. */
  share?: boolean;
  /** A Download button, listing the Manifest's and the page's `rendering`. Default `true`. */
  download?: boolean;
  /** A filter field over the thumbnails. Default `false`. */
  filter?: boolean;
};

/**
 * The layout of Clover 3.x's Viewer, built from 4.x parts.
 *
 * The title and its actions across the top; the stage, with the information panel to its
 * right; and under the stage the thumbnail strip, headed by the position and a pair of
 * arrows. Narrow screens stack the panel below. Size it with `--clover-content-height`.
 */
export function Classic({
  className,
  panel = true,
  defaultPanelOpen = true,
  share = true,
  download = true,
  filter = false,
  ...root
}: ClassicProps) {
  const [open, setOpen] = useState(defaultPanelOpen);
  const panelId = `${useId().replace(/:/g, "")}-panel`;
  return (
    <Clover.Root
      className={["clover-template-classic", className]
        .filter(Boolean)
        .join(" ")}
      {...root}
    >
      <header className="clover-template-classic-header">
        <Clover.Label as="h2" className="clover-template-classic-title" />
        <Clover.CollectionSelect className="clover-template-classic-collection" />
        {download && <Clover.Download />}
        {share && <Clover.Share />}
      </header>
      <Clover.Status />
      <div
        className="clover-template-classic-body"
        data-panel-open={panel && open}
      >
        <div className="clover-template-classic-main">
          <Clover.Content className="clover-template-classic-stage">
            {panel && (
              <Clover.PanelToggle
                open={open}
                onOpenChange={setOpen}
                controls={panelId}
              />
            )}
          </Clover.Content>
          <div className="clover-template-classic-rail">
            <div className="clover-template-classic-rail-header">
              <Clover.Position />
              <Clover.Previous className="clover-template-classic-step" />
              <Clover.Next className="clover-template-classic-step" />
            </div>
            <Clover.Items layout="carousel" filter={filter} />
          </div>
        </div>
        {panel && (
          <Clover.InformationPanel
            id={panelId}
            className="clover-template-classic-panel"
            hidden={!open}
            onClose={() => setOpen(false)}
          />
        )}
      </div>
    </Clover.Root>
  );
}
