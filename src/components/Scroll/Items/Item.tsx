import {
  AnnotationTarget,
  CanvasNormalized,
  EmbeddedResource,
  Reference,
  W3CAnnotationTarget,
} from "@iiif/presentation-3";
import { ScrollContext, initialState } from "src/context/scroll-context";
import {
  languageColumn,
  languageColumns as languageColumnsWrapper,
  pageBreak,
  scrollItem,
  scrollItemFigure,
  scrollItemTextualBodies,
} from "src/components/Scroll/Items/Items.css";

import React from "react";
import ScrollFigure from "src/components/Scroll/Figure/Figure";
import ScrollItemBody from "src/components/Scroll/Annotation/Body";
import { resolveAnnotationBodies } from "src/lib/annotation-helpers";

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

  const stripFragment = (targetId: string) => targetId.split("#")[0];
  const hasSourceProperty = (value: unknown): value is { source?: unknown } => {
    return typeof value === "object" && value !== null && "source" in value;
  };
  const hasIdProperty = (value: unknown): value is { id: string } => {
    return (
      typeof value === "object" &&
      value !== null &&
      "id" in value &&
      typeof (value as { id?: unknown }).id === "string"
    );
  };

  const getTargetCanvasId = (
    target:
      | AnnotationTarget
      | AnnotationTarget[]
      | W3CAnnotationTarget
      | W3CAnnotationTarget[]
      | string
      | undefined,
  ): string | undefined => {
    if (!target) return undefined;

    if (Array.isArray(target)) {
      for (const entry of target) {
        const resolvedId = getTargetCanvasId(entry);
        if (resolvedId) return resolvedId;
      }
      return undefined;
    }

    if (typeof target === "string") {
      return stripFragment(target);
    }

    if (hasSourceProperty(target)) {
      const targetSource = target.source;

      if (typeof targetSource === "string") {
        return stripFragment(targetSource);
      }

      if (hasIdProperty(targetSource)) {
        return stripFragment(targetSource.id);
      }
    }

    if (hasIdProperty(target)) {
      return stripFragment(target.id);
    }

    return undefined;
  };

  const canvasAnnotations =
    annotations?.filter((annotation) => {
      const annotationTargetId = getTargetCanvasId(annotation.target);
      return annotationTargetId === item.id;
    }) || [];

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
      const resolvedBodies = resolveAnnotationBodies(annotation, vault);

      resolvedBodies.forEach((body) => {
        const languageValue = resolveBodyLanguage(body);
        const key = languageValue || "__undefined__";

        if (!accumulator[key]) {
          accumulator[key] = {
            label: languageValue,
            bodies: [],
          };
        }

        accumulator[key].bodies.push(body);
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

  const renderedLanguageColumns = languagesToRender.map((key) => {
    const group = languageGroups[key];
    if (!group) return null;
    const heading = group.label || "Unspecified";
    const langAttribute = group.label ? group.label : undefined;

    return (
      <div
        className={languageColumn}
        key={key}
        data-language={heading}
        lang={langAttribute}
      >
        {group.bodies.map((body, index) => (
          <ScrollItemBody body={body} key={`${body.id || key}-${index}`} />
        ))}
      </div>
    );
  });

  const visibleColumns = renderedLanguageColumns.filter(
    (column): column is JSX.Element => Boolean(column),
  );
  const columnCount = visibleColumns.length || 1;

  const canvasInfo = {
    current: itemNumber,
    total: itemCount,
  };

  return (
    <>
      <article
        className={scrollItem}
        data-page-break={hasItemBreak}
        data-page-number={itemNumber}
        data-last-item={isLastItem}
      >
        <div
          className={scrollItemFigure}
          style={{
            width: figureWidth,
          }}
          data-width={figureWidth}
        >
          {canvas && <ScrollFigure canvas={canvas} canvasInfo={canvasInfo} />}
        </div>
        <div className={scrollItemTextualBodies}>
          <div
            className={languageColumnsWrapper}
            style={{ "--num-items": columnCount } as React.CSSProperties}
            data-columns={columnCount}
            data-testid="scroll-item-language-columns"
          >
            {visibleColumns.length
              ? visibleColumns
              : !annotationsLoading && <></>}
          </div>
        </div>
      </article>
      {hasItemBreak && <hr aria-label="Page Break" className={pageBreak} />}
    </>
  );
};

export default React.memo(ScrollItem);
