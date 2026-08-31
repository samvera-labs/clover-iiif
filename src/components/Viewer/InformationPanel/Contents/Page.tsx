import React from "react";
import type { RangeTableOfContentsNode } from "@iiif/helpers/ranges";
import { Label } from "src/components/Primitives";
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

const getCanvasNumber = (
  canvasId: string | undefined,
  sequence: ReturnType<typeof useViewerState>["sequence"],
) => {
  if (!canvasId) return null;

  const canvases = sequence?.[0] ?? [];
  const index = canvases.findIndex((canvas) => canvas.id === canvasId);
  if (index === -1) return null;

  return index + 1;
};

const ContentsNode = ({ node }: { node: RangeTableOfContentsNode }) => {
  const dispatch = useViewerDispatch();
  const { activeCanvas, sequence } = useViewerState();
  const targetCanvas = getFirstCanvasId(node);
  const canvasNumber = getCanvasNumber(targetCanvas, sequence);
  const children = getRangeChildren(node);

  const handleClick = () => {
    if (!targetCanvas || targetCanvas === activeCanvas) return;

    dispatch({
      type: "updateActiveCanvas",
      canvasId: targetCanvas,
    });
  };

  return (
    <li className="clover-viewer-contents-item">
      <button
        className="clover-viewer-contents-button"
        aria-current={targetCanvas === activeCanvas ? "page" : undefined}
        disabled={!targetCanvas}
        onClick={handleClick}
        type="button"
      >
        {canvasNumber && (
          <span className="clover-viewer-contents-position" aria-hidden="true">
            {canvasNumber}
          </span>
        )}
        <Label label={node.label || fallbackLabel} />
      </button>
      {children.length > 0 && (
        <ol className="clover-viewer-contents-list">
          {children.map((child) => (
            <ContentsNode key={child.id} node={child} />
          ))}
        </ol>
      )}
    </li>
  );
};

const ContentsPage = ({ tree }: ContentsPageProps) => {
  const nodes = getTopLevelNodes(tree);

  return (
    <ol className="clover-viewer-contents-list" data-testid="contents-list">
      {nodes.map((node) => (
        <ContentsNode key={node.id} node={node} />
      ))}
    </ol>
  );
};

export default ContentsPage;
