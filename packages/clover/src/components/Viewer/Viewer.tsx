import React, { forwardRef, useId, useState } from "react";

import { Content } from "../Content/Content";
import { InformationPanel } from "../InformationPanel/InformationPanel";
import { PanelToggle } from "../InformationPanel/PanelToggle";
import { Items, type ItemsLayout } from "../Items/Items";
import { CollectionSelect } from "../CollectionSelect/CollectionSelect";
import { Label } from "../Label/Label";
import { Pager } from "../Pager/Pager";
import { Root, type RootProps } from "../Root/Root";
import { Download } from "../Download/Download";
import { Share } from "../Share/Share";
import { Status } from "../Status/Status";
import { join } from "../../lib/classnames";

export type ViewerProps = Omit<RootProps, "children"> & {
  /** The thumbnails below the pager: a layout, or `false` for none. Default `carousel`. */
  items?: ItemsLayout | false;
  /** The information panel beside the stage, with its toggle. Default `true`. */
  panel?: boolean;
  /** Whether the panel starts open. Default `true`. */
  defaultPanelOpen?: boolean;
  /** A Share button in the header, copying a link to where the reader is. Default `true`. */
  share?: boolean;
  /** A Download button, listing the Manifest's and the page's `rendering`. Default `true`. */
  download?: boolean;
};

/**
 * A ready-made viewer, built only from the public parts, so a custom layout can start
 * from a copy of this file:
 *
 * ```jsx
 * const [open, setOpen] = useState(true);
 *
 * <Clover.Root iiifContent={url} className="clover-layout">
 *   <header className="clover-layout-header">
 *     <Clover.Label as="h2" />
 *     <Clover.CollectionSelect />
 *     <Clover.Download />
 *     <Clover.Share />
 *   </header>
 *   <Clover.Status />
 *   <div className="clover-layout-body">
 *     <div className="clover-layout-main">
 *       <Clover.Content>
 *         <Clover.PanelToggle open={open} onOpenChange={setOpen} controls="panel" />
 *       </Clover.Content>
 *       <Clover.Pager />
 *       <Clover.Items />
 *     </div>
 *     <Clover.InformationPanel id="panel" hidden={!open} />
 *   </div>
 * </Clover.Root>
 * ```
 */
export const Viewer = forwardRef<HTMLElement, ViewerProps>(function Viewer(
  {
    className,
    items = "carousel",
    panel = true,
    defaultPanelOpen = true,
    share = true,
    download = true,
    ...root
  },
  ref,
) {
  const [open, setOpen] = useState(defaultPanelOpen);
  const panelId = `${useId().replace(/:/g, "")}-panel`;
  return (
    <Root ref={ref} className={join("clover-layout", className)} {...root}>
      <header className="clover-layout-header">
        <Label as="h2" className="clover-layout-title" />
        <CollectionSelect className="clover-layout-collection" />
        {download && <Download />}
        {share && <Share />}
      </header>
      <Status />
      <div className="clover-layout-body" data-panel-open={panel && open}>
        <div className="clover-layout-main">
          <Content>
            {panel && (
              <PanelToggle
                open={open}
                onOpenChange={setOpen}
                controls={panelId}
              />
            )}
          </Content>
          <Pager />
          {items && <Items layout={items} />}
        </div>
        {panel && (
          <InformationPanel
            id={panelId}
            className="clover-layout-panel"
            hidden={!open}
            onClose={() => setOpen(false)}
          />
        )}
      </div>
    </Root>
  );
});
