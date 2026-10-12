import React, { useId, useRef, useState } from "react";

import * as Clover from "../../parts";
import type { InformationPanelLayout, RootProps } from "../../parts";
import { useFocusOnOpen, useSlide } from "../shared/useSlide";
import { usePaging } from "./usePaging";

export type DocumentProps = Omit<RootProps, "children"> & {
  /** Whether the page thumbnails start shown. Default: shown on a wide screen. */
  defaultSidebarOpen?: boolean;
  /** Whether the information panel starts open. Default `false`. */
  defaultPanelOpen?: boolean;
  /**
   * How the information panel lays out its sections: `"tabs"` (the default) or
   * `"accordion"`, stacked boxes each opened by its heading.
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
 * or narrows them. The information panel slides out over the right of the page. Size it with `--clover-template-document-height`.
 */
export function Document({
  className,
  defaultSidebarOpen,
  defaultPanelOpen = false,
  panelLayout,
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
  const slide = useSlide(panel);
  const panelRef = useRef<HTMLElement>(null);
  useFocusOnOpen(panelRef, panel && slide.mounted);

  const stage = useRef<HTMLDivElement>(null);
  // A turn only changes which Canvas the stage shows: the same Canvas, renderer and
  // camera swap their content, with no motion of their own.
  usePaging(stage, navigation);

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
            <svg
              aria-hidden="true"
              focusable="false"
              width="18"
              height="18"
              viewBox="0 0 18 18"
            >
              <rect
                x="1.5"
                y="2.5"
                width="15"
                height="13"
                rx="2"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.5"
              />
              <path d="M6.5 2.5v13" stroke="currentColor" strokeWidth="1.5" />
              {sidebar && (
                <path
                  d="M2.5 3.5h4v11h-4z"
                  fill="currentColor"
                  opacity="0.35"
                />
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
          <Clover.Previous className="clover-template-document-step" iconOnly />
          <Clover.Position />
          <Clover.Next className="clover-template-document-step" iconOnly />
        </div>
        <Clover.CollectionSelect className="clover-template-document-collection" />
        {download && <Clover.Download />}
      </header>
      <Clover.Status />
      <Clover.Split
        className="clover-template-document-body"
        data-sidebar={showSidebar ? "open" : "closed"}
        storageKey={storageKey || undefined}
      >
        <Clover.SplitPane
          as="aside"
          id={`${id}-sidebar`}
          name="sidebar"
          className="clover-template-document-sidebar"
          aria-label={t("templateSidebar")}
          size="11rem"
          min="8rem"
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
        <Clover.SplitPane className="clover-template-document-main" min="16rem">
          <div ref={stage} className="clover-template-document-stage">
            <Clover.Content className="clover-template-document-content">
              <Clover.PanelToggle
                open={panel}
                onOpenChange={setPanel}
                controls={`${id}-panel`}
              />
            </Clover.Content>
          </div>
          <div
            id={`${id}-panel`}
            className="clover-template-document-panel"
            data-open={slide.open}
            hidden={!slide.mounted}
          >
            {/* It floats over the page, so Escape puts it away too. */}
            <Clover.InformationPanel
              ref={panelRef}
              layout={panelLayout}
              onClose={() => setPanel(false)}
              closeOnEscape
            />
          </div>
        </Clover.SplitPane>
      </Clover.Split>
    </>
  );
}
