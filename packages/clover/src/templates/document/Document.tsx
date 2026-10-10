import React, { useEffect, useId, useRef, useState } from "react";

import * as Clover from "../../index";
import type { RootProps } from "../../index";
import { usePaging } from "./usePaging";

export type DocumentProps = Omit<RootProps, "children"> & {
  /** Whether the page thumbnails start shown. Default: shown on a wide screen. */
  defaultSidebarOpen?: boolean;
  /** Whether the information panel starts open. Default `false`. */
  defaultPanelOpen?: boolean;
  /** A Share button in the toolbar. Default `true`. */
  share?: boolean;
  /** A Download button in the toolbar, listing the Manifest's and the page's `rendering`. Default `true`. */
  download?: boolean;
};

/**
 * A layout that reads like a PDF viewer: a toolbar, page thumbnails down the left, and one
 * whole page at a time, never part of the next. Scrolling turns the page — one gesture,
 * one page — as do PageUp and PageDown. The information panel slides out over the right
 * of the page. Size it with `--clover-template-document-height`.
 */
export function Document({
  className,
  defaultSidebarOpen,
  defaultPanelOpen = false,
  share = true,
  download = true,
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
        share={share}
        download={download}
      />
    </Clover.Root>
  );
}

const NARROW = "(max-width: 40rem)";

function DocumentLayout({
  defaultSidebarOpen,
  defaultPanelOpen,
  share,
  download,
}: Pick<
  DocumentProps,
  "defaultSidebarOpen" | "defaultPanelOpen" | "share" | "download"
>) {
  const t = Clover.useT();
  const id = useId().replace(/:/g, "");
  const navigation = Clover.useNavigation();
  const [sidebar, setSidebar] = useState(
    () =>
      defaultSidebarOpen ??
      !(typeof window !== "undefined" && window.matchMedia?.(NARROW).matches),
  );
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
              <path d="M2.5 3.5h4v11h-4z" fill="currentColor" opacity="0.35" />
            )}
          </svg>
          <span style={Clover.visuallyHidden}>
            {t("templateSidebarToggle")}
          </span>
        </button>
        <Clover.Label as="h2" className="clover-template-document-title" />
        <div className="clover-template-document-pager">
          <Clover.Previous className="clover-template-document-step" />
          <Clover.Position />
          <Clover.Next className="clover-template-document-step" />
        </div>
        <Clover.CollectionSelect className="clover-template-document-collection" />
        {download && <Clover.Download />}
        {share && <Clover.Share />}
      </header>
      <Clover.Status />
      <div
        className="clover-template-document-body"
        data-sidebar={sidebar ? "open" : "closed"}
      >
        <aside
          id={`${id}-sidebar`}
          className="clover-template-document-sidebar"
          aria-label={t("templateSidebar")}
          hidden={!sidebar}
        >
          <Clover.Items
            layout="list"
            aria-label={t("templateSidebar")}
            thumbnailSize={160}
            onSelect={choose}
          />
        </aside>
        <div className="clover-template-document-main">
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
              onClose={() => setPanel(false)}
              closeOnEscape
            />
          </div>
        </div>
      </div>
    </>
  );
}

/**
 * Opening the panel takes focus into it, at its current tab, as an overlay should: it
 * covers the page, so the reader's next keys belong to it. Not on arrival with it open.
 * `shown` turns true in the commit that takes `hidden` off its wrapper, so it can be
 * focused at once.
 */
function useFocusOnOpen(panel: React.RefObject<HTMLElement>, shown: boolean) {
  const was = useRef(shown);
  useEffect(() => {
    const opened = shown && !was.current;
    was.current = shown;
    if (!opened) return;
    panel.current
      ?.querySelector<HTMLElement>('[role="tab"][aria-selected="true"]')
      ?.focus({ preventScroll: true });
  }, [panel, shown]);
}

/** Long enough for the panel's slide; it is `hidden` once it is out of sight. */
const SLIDE_MS = 240;

/**
 * Present while open or sliding: `mounted` keeps it out of `hidden`, and `open` lags one
 * frame behind so the slide in has somewhere to start from.
 */
function useSlide(want: boolean) {
  const [mounted, setMounted] = useState(want);
  const [open, setOpen] = useState(want);
  useEffect(() => {
    if (want) {
      setMounted(true);
      const frame = requestAnimationFrame(() =>
        requestAnimationFrame(() => setOpen(true)),
      );
      return () => cancelAnimationFrame(frame);
    }
    setOpen(false);
    const timer = setTimeout(() => setMounted(false), SLIDE_MS);
    return () => clearTimeout(timer);
  }, [want]);
  return { mounted, open: want && open };
}
