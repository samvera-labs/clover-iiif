import {
  CanvasNormalized,
  EmbeddedResource,
  Reference,
} from "@iiif/presentation-3";
import {
  PageBreak,
  StyledItem,
  StyledItemFigure,
  StyledItemTextualBodies,
} from "src/components/Scroll/Items/Items.styled";

import { Label } from "src/components/Primitives";
import React from "react";
import { ScrollContext } from "src/context/scroll-context";
import ScrollFigure from "src/components/Scroll/Figure/Figure";
import ScrollItemBody from "src/components/Scroll/Annotation/Body";

interface ScrollItemProps {
  hasItemBreak: boolean;
  isLastItem: boolean;
  item: Reference<"Canvas">;
  itemCount: number;
  itemNumber: number;
}

// design svg for page break that  a line with triangles symbolizing a page break

const ScrollItem: React.FC<ScrollItemProps> = ({
  hasItemBreak,
  isLastItem,
  item,
  itemCount,
  itemNumber,
}) => {
  const { state } = React.useContext(ScrollContext);
  const { annotations, vault } = state;

  const canvas: CanvasNormalized | undefined = vault?.get(item);

  const annotationBody = annotations
    ?.filter((annotation) => annotation.target === item.id)
    ?.map((annotation) => {
      return annotation?.body?.map((body, index) => (
        <ScrollItemBody
          body={body as unknown as EmbeddedResource}
          key={index}
        />
      ));
    });

  const canvasInfo = {
    current: itemNumber,
    total: itemCount,
  };

  return (
    <StyledItem
      data-page-break={hasItemBreak}
      data-page-number={itemNumber}
      data-last-item={isLastItem}
    >
      <StyledItemFigure>
        {canvas && <ScrollFigure canvas={canvas} canvasInfo={canvasInfo} />}
      </StyledItemFigure>
      <StyledItemTextualBodies>
        {canvas?.label && (
          <strong>
            <Label label={canvas?.label} />{" "}
            {`(${canvasInfo.current} / ${canvasInfo.total})`}
          </strong>
        )}
        <div>{annotationBody ? annotationBody : <p>[Blank]</p>}</div>

        {hasItemBreak && <PageBreak aria-label="Page Break" />}
      </StyledItemTextualBodies>
    </StyledItem>
  );
};

export default React.memo(ScrollItem);
