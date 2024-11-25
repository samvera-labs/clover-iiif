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
import { ScrollContext, initialState } from "src/context/scroll-context";

import React from "react";
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
  const { activeLanguages, annotations, vault, options } = state;
  const { figure } = options;

  const canvas = vault?.get(item) as CanvasNormalized;

  const numItems = activeLanguages?.length;

  const annotationBody = annotations
    // @ts-ignore
    ?.filter((annotation) => annotation.target?.source?.id === item.id)
    ?.map((annotation) => {
      return annotation?.body.map((body, index) => (
        <ScrollItemBody
          body={body as unknown as EmbeddedResource}
          key={index}
          numItems={numItems}
        />
      ));
    });

  const canvasInfo = {
    current: itemNumber,
    total: itemCount,
  };

  return (
    <>
      <StyledItem
        data-page-break={hasItemBreak}
        data-page-number={itemNumber}
        data-last-item={isLastItem}
      >
        <StyledItemFigure
          css={{
            width: figure.width
              ? figure.width
              : initialState.options.figure.width,
          }}
          data-width={figure.width}
        >
          {canvas && <ScrollFigure canvas={canvas} canvasInfo={canvasInfo} />}
        </StyledItemFigure>
        <StyledItemTextualBodies>
          <div>{annotationBody?.length ? annotationBody : <p>[Blank]</p>}</div>
        </StyledItemTextualBodies>
      </StyledItem>
      {hasItemBreak && <PageBreak aria-label="Page Break" />}
    </>
  );
};

export default React.memo(ScrollItem);
