import React, { useEffect, useId, useRef, useState } from "react";

import * as Clover from "../../parts";
import type { InformationPanelLayout, RootProps } from "../../parts";
import { useDragToClose } from "../shared/useDragToClose";
import { useFocusOnOpen, useSlide, useWideEnough } from "../shared/useSlide";
import { type PullListener, usePaging } from "./usePaging";

export type DocumentProps = Omit<RootProps, "children"> & {
  /** Whether the page thumbnails start shown. Default: shown on a wide screen. */
  defaultSidebarOpen?: boolean;
  /** Whether the information panel starts open. Default `false`. */
  defaultPanelOpen?: boolean;
  /**
   * How the information panel lays out its sections: `"accordion"` (the default, as
   * Default's), stacked boxes each opened by its heading, or `"tabs"`.
   */
  panelLayout?: InformationPanelLayout;
  /** A Download button in the toolbar, listing the Manifest's and the page's `rendering`. Default `true`. */
  download?: boolean;
  /**
   * Where the thumbnails' width is remembered once the reader drags the bar beside them
   * (`localStorage`). Default `"clover-template-document"`; `false` forgets it.
   */
  storageKey?: string | false;
};

/**
 * A layout that reads like a PDF viewer: a toolbar, page thumbnails down the left, and one
 * whole page at a time, never part of the next. Scrolling turns the page — one gesture,
 * one page — as do PageUp and PageDown. A bar between the thumbnails and the page widens
 * or narrows them. The information panel sits to the right of the page, with its own bar,
 * where there is room for both, and slides out over the page where there is not. Size
 * it with `--clover-template-document-height`.
 */
export function Document({
  className,
  defaultSidebarOpen,
  defaultPanelOpen = false,
  panelLayout = "accordion",
  download = true,
  storageKey = "clover-template-document",
  ...root
}: DocumentProps) {
  return (
    <Clover.Root
      className={["clover-template-document", className]
        .filter(Boolean)
        .join(" ")}
      {...root}
    >
      <DocumentLayout
        defaultSidebarOpen={defaultSidebarOpen}
        defaultPanelOpen={defaultPanelOpen}
        panelLayout={panelLayout}
        download={download}
        storageKey={storageKey}
      />
    </Clover.Root>
  );
}

const NARROW = "(max-width: 40rem)";

/** The narrowest the page and the panel may be dragged, side by side. */
const PAGE_MIN = "16rem";
const PANEL_MIN = "14rem";
/**
 * The room the page and the panel need beside each other, with the bar between them,
 * and the thumbnails' narrowest and their bar when they show. Any narrower and the panel
 * slides over the page instead.
 */
const BESIDE_REM = 16 + 14 + 1;
const SIDEBAR_REM = 8 + 1;

function DocumentLayout({
  defaultSidebarOpen,
  defaultPanelOpen,
  download,
  storageKey,
  panelLayout,
}: Pick<
  DocumentProps,
  | "defaultSidebarOpen"
  | "defaultPanelOpen"
  | "download"
  | "storageKey"
  | "panelLayout"
>) {
  const t = Clover.useT();
  const id = useId().replace(/:/g, "");
  const navigation = Clover.useNavigation();
  const [sidebar, setSidebar] = useState(
    () =>
      defaultSidebarOpen ??
      !(typeof window !== "undefined" && window.matchMedia?.(NARROW).matches),
  );
  /*
   * Thumbnails only when there is more than one page to choose. Until the content has
   * loaded there are none, so a one-page document never shows an empty sidebar first.
   * The pane stays in the tree, hidden, so the page beside it is never remounted.
   */
  const pages = navigation.total > 1;
  const showSidebar = pages && sidebar;
  const [panel, setPanel] = useState(Boolean(defaultPanelOpen));
  /*
   * The panel sits beside the page, its own pane with a bar to share the width, where
   * there is room for both, as Default's does; where there is not, it slides over the
   * page, takes focus, and closes on its own button or Escape.
   */
  const body = useRef<HTMLElement>(null);
  const beside = useWideEnough(
    body,
    BESIDE_REM + (showSidebar ? SIDEBAR_REM : 0),
  );
  const over = !beside;
  const slide = useSlide(over && panel);
  const panelRef = useRef<HTMLElement>(null);
  useFocusOnOpen(panelRef, over && slide.mounted);
  const panelShown = over ? slide.mounted : panel;

  /*
   * Whatever floats over the page can be dragged back off the way it came, as an app's
   * drawer can, and a press on the page beside it puts it away: the panel to the end, and
   * on a phone the thumbnails to the start.
   */
  const narrow = useMatches(NARROW);
  const panelPane = useRef<HTMLElement>(null);
  const scrim = useRef<HTMLDivElement>(null);
  useDragToClose(panelPane, {
    enabled: over && slide.open,
    side: "end",
    onClose: () => setPanel(false),
    scrim,
  });
  const sidebarPane = useRef<HTMLElement>(null);
  useDragToClose(sidebarPane, {
    enabled: narrow && showSidebar,
    side: "start",
    onClose: () => setSidebar(false),
    exits: true,
  });

  const stage = useRef<HTMLDivElement>(null);
  /*
   * A scroll on its way to a turn shows how near it is (`Document.css`): the pull goes
   * straight to the stage's style, never through React, so the wheel never re-renders.
   */
  const pull: PullListener = (amount, phase) => {
    const element = stage.current;
    if (!element) return;
    // The page leans while pulled; turned or let go, it is back in place.
    element.style.setProperty(
      "--clover-template-document-pull",
      String(phase === "pull" ? amount : 0),
    );
    if (phase === "turn") {
      // The chevron the turn came from holds a moment, then fades: started afresh even
      // when two turns come with no pull between them.
      element.dataset.turned = amount > 0 ? "next" : "previous";
      delete element.dataset.pull;
      void element.offsetWidth;
    }
    element.dataset.pull = phase;
  };
  // A turn only changes which Canvas the stage shows: the same Canvas, renderer and
  // camera swap their content, with no motion of their own.
  usePaging(stage, navigation, pull);

  // On a narrow screen the sidebar covers the page: choosing a page puts it away.
  const choose = () => {
    if (window.matchMedia?.(NARROW).matches) setSidebar(false);
  };

  return (
    <>
      <header className="clover-template-document-toolbar">
        {pages && (
          <button
            type="button"
            className="clover-template-document-sidebar-toggle"
            aria-expanded={sidebar}
            aria-controls={`${id}-sidebar`}
            onClick={() => setSidebar((open) => !open)}
          >
            {/*
             * The panel toggle's glyph (`Clover.PanelToggle`), mirrored: a page with a
             * side pane, here on the left, filled while the items show.
             */}
            <svg
              aria-hidden="true"
              focusable="false"
              width="16"
              height="16"
              viewBox="0 0 512 512"
              fill="currentColor"
              stroke="currentColor"
            >
              <rect
                x="64"
                y="96"
                width="384"
                height="320"
                rx="40"
                fill="none"
                strokeWidth="36"
              />
              <path d="M192 96v320" fill="none" strokeWidth="36" />
              {sidebar && (
                <path d="M192 96h-88a40 40 0 0 0-40 40v240a40 40 0 0 0 40 40h88z" />
              )}
            </svg>
            <span style={Clover.visuallyHidden}>
              {t("templateSidebarToggle")}
            </span>
            <Clover.Tip label={t("templateSidebarToggle")} />
          </button>
        )}
        <Clover.Label as="h2" className="clover-template-document-title" />
        <div className="clover-template-document-pager">
          <Clover.Previous />
          <Clover.Position />
          <Clover.Next />
        </div>
        <Clover.CollectionSelect className="clover-template-document-collection" />
        {download && <Clover.Download />}
      </header>
      {/* Its stage shows the loading; announced here, nothing moves. */}
      <Clover.Status loading={false} />
      <Clover.Split
        ref={body}
        className="clover-template-document-body"
        data-sidebar={showSidebar ? "open" : "closed"}
        data-panel={over ? "over" : "beside"}
        storageKey={storageKey || undefined}
      >
        <Clover.SplitPane
          ref={sidebarPane}
          as="aside"
          id={`${id}-sidebar`}
          name="sidebar"
          className="clover-template-document-sidebar"
          aria-label={t("templateSidebar")}
          size="13rem"
          // On a phone Items slides over the Canvas, so it takes no room from it.
          min={narrow ? undefined : "8rem"}
          max="24rem"
          hidden={!showSidebar}
        >
          <Clover.Items
            layout="list"
            aria-label={t("templateSidebar")}
            thumbnailSize={320}
            onSelect={choose}
          />
        </Clover.SplitPane>
        {/* The bar between the thumbnails and the page; hidden where they cover it. */}
        {showSidebar && <Clover.SplitHandle aria-controls={`${id}-sidebar`} />}
        <Clover.SplitPane
          className="clover-template-document-main"
          // A minimum only beside another pane: Items, or the InformationPanel docked.
          min={
            (showSidebar && !narrow) || (panel && !over) ? PAGE_MIN : undefined
          }
        >
          <div ref={stage} className="clover-template-document-stage">
            <Clover.Content className="clover-template-document-content">
              <Clover.PanelToggle
                open={panel}
                onOpenChange={setPanel}
                controls={`${id}-panel`}
              />
            </Clover.Content>
            {pages && (
              <>
                <PullCue direction="previous" />
                <PullCue direction="next" />
              </>
            )}
          </div>
        </Clover.SplitPane>
        {/* The bar between the page and the panel beside it; over the page, none. */}
        {!over && panel && <Clover.SplitHandle aria-controls={`${id}-panel`} />}
        <Clover.SplitPane
          ref={panelPane}
          id={`${id}-panel`}
          data-spine={over || undefined}
          name="panel"
          className="clover-template-document-panel"
          size="24rem"
          min={over ? undefined : PANEL_MIN}
          data-open={over ? slide.open : panel}
          hidden={!panelShown}
        >
          {/* Over the page it floats, so Escape and its own button put it away too. */}
          <Clover.InformationPanel
            ref={panelRef}
            layout={panelLayout}
            onClose={over ? () => setPanel(false) : undefined}
            closeOnEscape={over}
          />
        </Clover.SplitPane>
        {/* A press on the page beside what covers it puts that away. */}
        {over && slide.mounted && (
          <div
            ref={scrim}
            className="clover-template-document-scrim"
            data-open={slide.open}
            aria-hidden="true"
            onClick={() => setPanel(false)}
          />
        )}
        {narrow && showSidebar && (
          <div
            className="clover-template-document-scrim"
            data-for="sidebar"
            data-open="true"
            aria-hidden="true"
            onClick={() => setSidebar(false)}
          />
        )}
      </Clover.Split>
    </>
  );
}

/**
 * The page a scroll is pulling toward, signalled at the edge it will come from: a
 * chevron that rises in as the pull builds. Decorative: PageUp and PageDown, the pager and
 * the thumbnails all turn the page without it.
 */
function PullCue({ direction }: { direction: "previous" | "next" }) {
  return (
    <span
      aria-hidden="true"
      className="clover-template-document-cue"
      data-direction={direction}
    >
      <svg focusable="false" width="16" height="16" viewBox="0 0 16 16">
        <path
          d={direction === "next" ? "M3 6l5 5 5-5" : "M3 10l5-5 5 5"}
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    </span>
  );
}

/** Whether a media query matches, following it as it changes. */
function useMatches(query: string) {
  const [matches, setMatches] = useState(false);
  useEffect(() => {
    const list = window.matchMedia?.(query);
    if (!list) return;
    const update = () => setMatches(list.matches);
    update();
    list.addEventListener?.("change", update);
    return () => list.removeEventListener?.("change", update);
  }, [query]);
  return matches;
}
