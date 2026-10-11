import React, { useEffect, useId, useRef, useState } from "react";

import * as Clover from "../../parts";
import type {
  InformationPanelLayout,
  ItemsLayout,
  RootProps,
} from "../../parts";
import { useFocusOnOpen, useSlide, useWideEnough } from "../shared/useSlide";

/** The narrowest the stage and the panel may be dragged, side by side. */
const STAGE_MIN = "16rem";
const PANEL_MIN = "14rem";
/**
 * The room both need beside each other: their minimums and the bar between them. Any
 * narrower (a phone) and the panel slides over the stage instead.
 */
const BESIDE_REM = 16 + 14 + 1;

export type DefaultProps = Omit<RootProps, "children"> & {
  /** The information panel beside the stage, with its toggle. Default `true`. */
  panel?: boolean;
  /** Whether the panel starts open. Default: open when it has room beside the stage. */
  defaultPanelOpen?: boolean;
  /**
   * How the information panel lays out its sections: `"accordion"` (the default),
   * stacked boxes each opened by its heading, or `"tabs"`.
   */
  panelLayout?: InformationPanelLayout;
  /** A Download button, listing the Manifest's and the page's `rendering`. Default `true`. */
  download?: boolean;
  /** The thumbnails under the stage: a layout, or `false` for none. Default `carousel`. */
  items?: ItemsLayout | false;
  /** A filter field over the thumbnails. Default `false`. */
  filter?: boolean;
  /**
   * Where the panel's width is remembered once the reader drags its bar
   * (`localStorage`). Default `"clover-template-default"`; `false` forgets it.
   */
  storageKey?: string | false;
};

/**
 * The Viewer's own layout, drawn when no `template` is given: Clover 3.x's Viewer, built
 * from 4.x parts. Copy this file to start a layout of your own.
 *
 * The title and its actions across the top; the stage, with the information panel to its
 * right; and under the stage the thumbnail strip, headed by the position and a pair of
 * arrows. The panel has its own space, as in 3.x, and a bar between it and the stage
 * shares the width (drag it, or use the arrow keys on it). Where there is no room for both
 * (a phone), the panel slides over the stage instead, and a strip of the page stays
 * uncovered: a click there, Escape or the panel's close button puts it away. Size it with
 * `--clover-content-height`.
 */
export function Default({
  className,
  panel = true,
  defaultPanelOpen,
  panelLayout = "accordion",
  download = true,
  items = "carousel",
  filter = false,
  storageKey = "clover-template-default",
  ...root
}: DefaultProps) {
  const body = useRef<HTMLElement>(null);
  const panelRef = useRef<HTMLElement>(null);
  const beside = useWideEnough(body, BESIDE_REM);
  /*
   * The reader's choice (or the host's, to start with); until one is made the panel is
   * open when it has room beside the stage, and closed when it would cover it.
   */
  const [choice, setChoice] = useState<boolean | undefined>(defaultPanelOpen);
  const open = choice ?? beside;
  const setOpen = (value: boolean) => setChoice(value);
  // Narrowing under an open panel closes it, rather than suddenly covering the page.
  const wasBeside = useRef(beside);
  useEffect(() => {
    if (wasBeside.current && !beside) setChoice(undefined);
    wasBeside.current = beside;
  }, [beside]);
  const over = !beside;
  // Only over the stage does it slide: beside it, it simply shows and hides.
  const slide = useSlide(over && open);
  useFocusOnOpen(panelRef, over && slide.mounted);
  const panelId = `${useId().replace(/:/g, "")}-panel`;
  const shown = over ? slide.mounted : open;
  return (
    <Clover.Root
      className={["clover-template-default", className]
        .filter(Boolean)
        .join(" ")}
      {...root}
    >
      <header className="clover-template-default-header">
        <Clover.Label as="h2" className="clover-template-default-title" />
        <Clover.CollectionSelect className="clover-template-default-collection" />
        {download && <Clover.Download />}
      </header>
      <Clover.Status />
      <Clover.Split
        ref={body}
        className="clover-template-default-body"
        data-panel={over ? "over" : "beside"}
        data-panel-open={panel && open}
        storageKey={storageKey || undefined}
      >
        <Clover.SplitPane
          className="clover-template-default-main"
          min={STAGE_MIN}
        >
          <Clover.Content className="clover-template-default-stage">
            {panel && (
              <Clover.PanelToggle
                open={open}
                onOpenChange={setOpen}
                controls={panelId}
              />
            )}
          </Clover.Content>
          <div className="clover-template-default-rail">
            <div className="clover-template-default-rail-header">
              <Clover.Position />
              <Steps />
            </div>
            {items && <Clover.Items layout={items} filter={filter} />}
          </div>
        </Clover.SplitPane>
        {panel && !over && open && (
          <Clover.SplitHandle aria-controls={panelId} />
        )}
        {panel && (
          <Clover.SplitPane
            id={panelId}
            name="panel"
            className="clover-template-default-panel"
            size="24rem"
            min={PANEL_MIN}
            data-open={over ? slide.open : open}
            hidden={!shown}
          >
            <Clover.InformationPanel
              ref={panelRef}
              layout={panelLayout}
              // Docked, the toggle closes it; over the stage, it carries its own close.
              onClose={over ? () => setOpen(false) : undefined}
              closeOnEscape={over}
            />
          </Clover.SplitPane>
        )}
        {panel && over && slide.mounted && (
          // The uncovered strip, and the stage under the panel: a click puts it away.
          <div
            className="clover-template-default-scrim"
            data-open={slide.open}
            aria-hidden="true"
            onClick={() => setOpen(false)}
          />
        )}
      </Clover.Split>
    </Clover.Root>
  );
}

/**
 * The strip's arrows, in reading order: a right-to-left book puts Next first, as
 * `Clover.Pager` does, and in the markup rather than by CSS, so focus follows the eye.
 */
function Steps() {
  const { direction } = Clover.useSequence();
  const previous = <Clover.Previous className="clover-template-default-step" />;
  const next = <Clover.Next className="clover-template-default-step" />;
  return direction === "right-to-left" ? (
    <>
      {next}
      {previous}
    </>
  ) : (
    <>
      {previous}
      {next}
    </>
  );
}
