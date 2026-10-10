import React, {
  forwardRef,
  useEffect,
  useState,
  useSyncExternalStore,
} from "react";

import {
  type ContentsNode,
  currentContents,
  tableOfContents,
} from "../../core/ranges";
import { localize } from "../../core/value";
import { useCloverTranslation } from "../../i18n/useCloverTranslation";
import { join } from "../../lib/classnames";
import { useClover, useCloverSelector } from "../../react/context";

export interface ContentsProps extends React.HTMLAttributes<HTMLElement> {
  as?: React.ElementType;
}

/**
 * The Manifest's table of contents, from its Ranges: chapters of a book, acts of an opera,
 * nested as they nest. The entry the reader is in is marked, following playback through a
 * time-based Canvas. Choosing an entry goes to its Canvas, and to its region or its moment.
 */
export const Contents = forwardRef<HTMLElement, ContentsProps>(
  function Contents({ as: Tag = "nav", className, ...rest }, ref) {
    const { t } = useCloverTranslation();
    const { clover, language } = useClover("Contents");
    const nodes = useCloverSelector((state) => tableOfContents(state.manifest));
    const canvasId = useCloverSelector((state) => state.canvasId);
    const element = useSyncExternalStore(
      clover.media.subscribe,
      clover.media.get,
      clover.media.get,
    );
    const current = useCurrent(nodes, canvasId, element);
    if (!nodes.length) return null;

    const choose = (node: ContentsNode) => {
      if (!node.canvasId) return;
      // On the Canvas playing: seek there. Elsewhere: go, arriving at the moment or region.
      if (node.canvasId === canvasId && node.time && element) {
        element.currentTime = node.time.start;
        return;
      }
      clover.goTo(node.canvasId, {
        ...(node.time ? { time: node.time.start } : {}),
        ...(node.region ? { region: node.region } : {}),
      });
    };

    const render = (list: ContentsNode[]) => (
      <ol className="clover-contents-list">
        {list.map((node) => (
          <li key={node.id} className="clover-contents-item">
            <button
              type="button"
              className="clover-contents-button"
              aria-current={node.id === current ? "true" : undefined}
              disabled={!node.canvasId}
              onClick={() => choose(node)}
            >
              {localize(node.label, language).text || node.id}
            </button>
            {node.children.length > 0 && render(node.children)}
          </li>
        ))}
      </ol>
    );

    return (
      <Tag
        ref={ref}
        aria-label={t("informationPanelTabsContents")}
        className={join("clover-contents", className)}
        {...rest}
      >
        {render(nodes)}
      </Tag>
    );
  },
);

/** The current entry, recomputed as media plays; a re-render only when it changes. */
function useCurrent(
  nodes: ContentsNode[],
  canvasId: string | null,
  element: HTMLVideoElement | null,
) {
  const [current, setCurrent] = useState<string | null>(() =>
    currentContents(nodes, canvasId),
  );
  useEffect(() => {
    const update = () =>
      setCurrent(currentContents(nodes, canvasId, element?.currentTime));
    update();
    if (!element) return;
    element.addEventListener("timeupdate", update);
    element.addEventListener("seeked", update);
    return () => {
      element.removeEventListener("timeupdate", update);
      element.removeEventListener("seeked", update);
    };
  }, [nodes, canvasId, element]);
  return current;
}
