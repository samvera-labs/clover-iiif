import React from "react";
import type { RangeTableOfContentsNode } from "@iiif/helpers/ranges";
import { Label } from "src/components/Primitives";
import { parseTimeFragment } from "src/hooks/use-iiif/getPlayerResources";
import { useViewerDispatch, useViewerState } from "src/context/viewer-context";

type ContentsPageProps = {
  tree: RangeTableOfContentsNode;
};

const fallbackLabel = { none: ["Untitled"] };

const getRangeChildren = (node: RangeTableOfContentsNode) =>
  node.items?.filter((item) => item.type === "Range") ?? [];

const getTopLevelNodes = (tree: RangeTableOfContentsNode) => {
  const rangeChildren = getRangeChildren(tree);
  return rangeChildren.length ? rangeChildren : [tree];
};

const getFirstCanvasId = (node: RangeTableOfContentsNode) =>
  node.firstCanvas?.source?.id ||
  (node.type === "Canvas" ? node.resource?.source?.id : undefined);

/**
 * The time fragment on whatever canvas this node points at.
 *
 * On a Range with children this is the *first child's* fragment, which is the right answer for
 * "where does clicking this take me" and the wrong one for "what does this cover" — so the two
 * questions are asked separately below.
 */
const getFragmentSpan = (node: RangeTableOfContentsNode) => {
  /* A SpecificResource may carry one selector or several; only a fragment selector has a time. */
  const selectors = [node.firstCanvas?.selector ?? []].flat();
  const fragment = selectors.find(
    (selector: any) => typeof selector?.value === "string",
  ) as { value: string } | undefined;
  if (!fragment) return undefined;

  const [, t] = fragment.value.split("t=");
  return parseTimeFragment(t);
};

/**
 * The span a Range covers, for deciding which row the playhead is in.
 *
 * Only a Range that targets a canvas directly can be placed on the timeline; a parent's extent
 * comes from its descendants, so its first child's fragment must not be read as its own.
 */
const getTimeSpan = (node: RangeTableOfContentsNode) =>
  node.isRangeLeaf || node.type === "Canvas"
    ? getFragmentSpan(node)
    : undefined;

/**
 * The one row the reader is inside, and the chapter that holds it.
 *
 * Marking every Range that targets the active canvas lit up a whole act at once — the parent
 * and both of its chapters — because they all point at the same canvas. A time-based canvas
 * can be far more precise: the Ranges carry `#t=` spans, so the row to mark is the deepest one
 * whose span holds the playhead, exactly as the transcript marks the one cue being spoken.
 *
 * `groupId` is the chapter drawn as current: the row's parent where it has one, otherwise the
 * row itself. The highlight belongs to the whole chapter rather than to a single line of it, so
 * a sub-chapter does not need a marker of its own and the emphasis is never drawn twice.
 */
const findCurrent = (
  nodes: RangeTableOfContentsNode[],
  activeCanvas: string | undefined,
  currentTime: number | undefined,
): { id: string; groupId: string } | undefined => {
  let best: { id: string; ancestors: string[]; depth: number } | undefined;

  const walk = (node: RangeTableOfContentsNode, ancestors: string[]) => {
    const canvasId = getFirstCanvasId(node);
    const span = getTimeSpan(node);

    if (canvasId === activeCanvas) {
      const withinSpan =
        span &&
        typeof currentTime === "number" &&
        currentTime >= span.start &&
        (span.end === undefined || currentTime < span.end);

      /**
       * A row that declares a span and does not hold the playhead is not current, even though
       * its canvas is — that is the whole point. A row with no span (an image canvas, or a
       * Range with no time fragment) still falls back to matching on canvas alone, so a
       * Manifest without times behaves exactly as it did.
       */
      const matches = span ? withinSpan : true;

      if (matches && (!best || ancestors.length >= best.depth)) {
        best = { id: node.id, ancestors, depth: ancestors.length };
      }
    }

    getRangeChildren(node).forEach((child) =>
      walk(child, [...ancestors, node.id]),
    );
  };

  nodes.forEach((node) => walk(node, []));

  if (!best) return undefined;

  return {
    id: best.id,
    groupId: best.ancestors[best.ancestors.length - 1] ?? best.id,
  };
};

/** The playhead, for as long as there is one to read. */
const useCurrentTime = () => {
  const { activePlayer } = useViewerState();
  const [currentTime, setCurrentTime] = React.useState<number>();

  React.useEffect(() => {
    if (!activePlayer) {
      setCurrentTime(undefined);
      return;
    }

    const onTimeUpdate = () => setCurrentTime(activePlayer.currentTime);
    onTimeUpdate();

    activePlayer.addEventListener("timeupdate", onTimeUpdate);
    return () => activePlayer.removeEventListener("timeupdate", onTimeUpdate);
  }, [activePlayer]);

  return currentTime;
};

const ContentsNode = ({
  currentId,
  groupId,
  node,
  onSelect,
}: {
  currentId?: string;
  groupId?: string;
  node: RangeTableOfContentsNode;
  onSelect: (node: RangeTableOfContentsNode) => void;
}) => {
  const targetCanvas = getFirstCanvasId(node);
  const children = getRangeChildren(node);

  return (
    <li
      className="clover-viewer-contents-item"
      data-current-group={node.id === groupId || undefined}
    >
      <button
        className="clover-viewer-contents-button"
        aria-current={node.id === currentId ? "page" : undefined}
        disabled={!targetCanvas}
        onClick={() => onSelect(node)}
        type="button"
      >
        <Label label={node.label || fallbackLabel} />
      </button>
      {children.length > 0 && (
        <ol className="clover-viewer-contents-list">
          {children.map((child) => (
            <ContentsNode
              currentId={currentId}
              groupId={groupId}
              key={child.id}
              node={child}
              onSelect={onSelect}
            />
          ))}
        </ol>
      )}
    </li>
  );
};

const ContentsPage = ({ tree }: ContentsPageProps) => {
  const dispatch = useViewerDispatch();
  const { activeCanvas, activePlayer } = useViewerState();
  const currentTime = useCurrentTime();
  const nodes = getTopLevelNodes(tree);

  /**
   * A seek waiting for the canvas it belongs to.
   *
   * Choosing a chapter on another canvas cannot seek straight away: the player for that canvas
   * does not exist yet, and the one on screen is about to be torn down. The time is parked here
   * and applied by the effect below once the new element is the active player.
   */
  const pendingSeek = React.useRef<{
    canvasId: string;
    fromSrc: string;
    time: number;
  }>();

  React.useEffect(() => {
    const pending = pendingSeek.current;
    if (!pending || !activePlayer || pending.canvasId !== activeCanvas) return;

    const media = activePlayer;

    /**
     * Seek only once the element is actually playing the canvas that was chosen.
     *
     * Two things make that harder than it sounds. `activeCanvas` changes the moment the choice
     * is made, while the media follows a beat later — and Vidstack reuses the same `<video>`
     * element when the new source needs the same provider, so the element's identity is no
     * signal at all. What does change is the source it is playing, and a fresh source has no
     * duration to seek within until its metadata arrives, so both have to hold.
     */
    const trySeek = () => {
      if (media.currentSrc === pending.fromSrc) return false;
      if (media.readyState < HTMLMediaElement.HAVE_METADATA) return false;

      pendingSeek.current = undefined;
      media.currentTime = pending.time;
      return true;
    };

    if (trySeek()) return;

    const onLoadedMetadata = () => trySeek();
    media.addEventListener("loadedmetadata", onLoadedMetadata);
    return () => media.removeEventListener("loadedmetadata", onLoadedMetadata);
  }, [activePlayer, activeCanvas]);

  /**
   * Choosing a chapter goes to that chapter.
   *
   * It used to only ever change canvas, and bail out early when the canvas was already the one
   * showing — so on a Manifest whose chapters are time fragments of a single canvas, which is
   * what `structures` on an A/V Manifest usually are, every chapter in the act did nothing at
   * all. Playback is left as it was found: a paused reader browsing the contents is not asking
   * to start it, and one who is already playing carries on from the new position.
   */
  const handleSelect = React.useCallback(
    (node: RangeTableOfContentsNode) => {
      const canvasId = getFirstCanvasId(node);
      if (!canvasId) return;

      const span = getFragmentSpan(node);

      if (canvasId !== activeCanvas) {
        if (span)
          pendingSeek.current = {
            canvasId,
            fromSrc: activePlayer?.currentSrc ?? "",
            time: span.start,
          };
        dispatch({ type: "updateActiveCanvas", canvasId });
        return;
      }

      if (span && activePlayer) activePlayer.currentTime = span.start;
    },
    [activeCanvas, activePlayer, dispatch],
  );

  const current = React.useMemo(
    () => findCurrent(nodes, activeCanvas, currentTime),
    [nodes, activeCanvas, currentTime],
  );

  return (
    <ol className="clover-viewer-contents-list" data-testid="contents-list">
      {nodes.map((node) => (
        <ContentsNode
          currentId={current?.id}
          groupId={current?.groupId}
          key={node.id}
          node={node}
          onSelect={handleSelect}
        />
      ))}
    </ol>
  );
};

export default ContentsPage;
