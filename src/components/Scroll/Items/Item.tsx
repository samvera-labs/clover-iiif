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
  StyledLanguageColumn,
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
  const { activeLanguages, annotations, annotationsLoading, vault, options } =
    state;
  const figureOptions = options.figure || {};
  const figureWidth =
    figureOptions.width || initialState.options.figure?.width || "38.2%";

  const canvas = vault?.get(item) as CanvasNormalized;

  const canvasAnnotations =
    annotations
      // @ts-ignore
      ?.filter((annotation) => annotation.target?.source?.id === item.id) || [];

  const resolveBodyLanguage = (body: EmbeddedResource): string | undefined => {
    const { language } = body as { language?: string | string[] };
    if (!language) return undefined;
    if (Array.isArray(language)) return language[0];
    return String(language);
  };

  const languageGroups = canvasAnnotations.reduce(
    (
      accumulator,
      annotation,
    ): Record<
      string,
      {
        label?: string;
        bodies: EmbeddedResource[];
      }
    > => {
      annotation?.body?.forEach((body) => {
        const embeddedBody = body as unknown as EmbeddedResource;
        if (!embeddedBody) return;

        const languageValue = resolveBodyLanguage(embeddedBody);
        const key = languageValue || "__undefined__";

        if (!accumulator[key]) {
          accumulator[key] = {
            label: languageValue,
            bodies: [],
          };
        }

        accumulator[key].bodies.push(embeddedBody);
      });

      return accumulator;
    },
    {},
  );

  const languageOrder = Object.keys(languageGroups);
  const hasLanguageFilter = Boolean(activeLanguages?.length);
  const languagesToRender = hasLanguageFilter
    ? languageOrder.filter((key) => {
        const language = languageGroups[key].label;
        if (!language) return false;
        return activeLanguages?.includes(language);
      })
    : languageOrder;

  const languageColumns = languagesToRender.map((key) => {
    const group = languageGroups[key];
    if (!group) return null;
    const heading = group.label || "Unspecified";
    const langAttribute = group.label ? group.label : undefined;

    return (
      <StyledLanguageColumn
        key={key}
        data-language={heading}
        lang={langAttribute}
      >
        {group.bodies.map((body, index) => (
          <ScrollItemBody
            body={body}
            key={`${body.id || key}-${index}`}
          />
        ))}
      </StyledLanguageColumn>
    );
  });

  const visibleColumns = languageColumns.filter(
    (column): column is JSX.Element => Boolean(column),
  );
  const columnCount = visibleColumns.length || 1;

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
            width: figureWidth,
          }}
          data-width={figureWidth}
        >
          {canvas && <ScrollFigure canvas={canvas} canvasInfo={canvasInfo} />}
        </StyledItemFigure>
        <StyledItemTextualBodies>
          <div
            style={{ "--num-items": columnCount } as React.CSSProperties}
            data-columns={columnCount}
            data-testid="scroll-item-language-columns"
          >
            {visibleColumns.length
              ? visibleColumns
              : !annotationsLoading && <p>[Blank]</p>}
          </div>
        </StyledItemTextualBodies>
      </StyledItem>
      {hasItemBreak && <PageBreak aria-label="Page Break" />}
    </>
  );
};

export default React.memo(ScrollItem);
