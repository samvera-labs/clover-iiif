import {
  ContentsButton,
  ContentsCanvasPosition,
  ContentsItem,
  ContentsList,
} from "src/components/Viewer/InformationPanel/Contents/Contents.styled";
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
    <ContentsItem>
      <ContentsButton
        aria-current={targetCanvas === activeCanvas ? "page" : undefined}
        disabled={!targetCanvas}
        onClick={handleClick}
        type="button"
      >
        {canvasNumber && (
          <ContentsCanvasPosition aria-hidden="true">
            {canvasNumber}
          </ContentsCanvasPosition>
        )}
        <Label label={node.label || fallbackLabel} />
      </ContentsButton>
      {children.length > 0 && (
        <ContentsList>
          {children.map((child) => (
            <ContentsNode key={child.id} node={child} />
          ))}
        </ContentsList>
      )}
    </ContentsItem>
  );
};

const ContentsPage = ({ tree }: ContentsPageProps) => {
  const nodes = getTopLevelNodes(tree);

  return (
    <ContentsList data-testid="contents-list">
      {nodes.map((node) => (
        <ContentsNode key={node.id} node={node} />
      ))}
    </ContentsList>
  );
};

export default ContentsPage;
