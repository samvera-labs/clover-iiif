import React, { useId, useMemo, useState } from "react";

import * as Clover from "../../index";
import type { AnnotationEntry, RootProps } from "../../index";
import { Lightbox } from "../shared/Lightbox";

export type TextProps = Omit<RootProps, "children" | "annotationPages"> & {
  /** A search field that narrows the pages to those whose text matches. Default `true`. */
  search?: boolean;
};

/**
 * A Manifest read as text, as Clover 3.x's Scroll reads it: one `article` per Canvas,
 * its image beside its annotations — transcriptions, translations, comments — in a column
 * per language. Pressing an image opens it in a lightbox to pan and zoom.
 *
 * Every Canvas's annotation pages are fetched (`annotationPages="all"`), since all of them
 * are on the page at once. Markdown bodies are read as Markdown.
 */
export function Text({ className, search = true, ...root }: TextProps) {
  return (
    <Clover.Root
      className={["clover-template-text", className].filter(Boolean).join(" ")}
      annotationPages="all"
      {...root}
    >
      <TextBody search={search} />
    </Clover.Root>
  );
}

/** A Canvas's text, by language: `[language, entries]`, in the order first met. */
function byLanguage(entries: AnnotationEntry[]) {
  const columns = new Map<string, Array<{ value: string; format?: string }>>();
  for (const entry of entries) {
    for (const body of entry.bodies) {
      if (!body.value) continue;
      const language = body.language ?? "none";
      if (!columns.has(language)) columns.set(language, []);
      columns.get(language)!.push({ value: body.value, format: body.format });
    }
  }
  return [...columns];
}

function TextBody({ search }: { search: boolean }) {
  const t = Clover.useT();
  const { canvases } = Clover.useSequence();
  const sets = Clover.useAnnotationSets();
  const { goTo } = Clover.useNavigation();
  const [query, setQuery] = useState("");
  const [open, setOpen] = useState(false);
  const id = useId().replace(/:/g, "");

  const entries = useMemo(() => {
    const map = new Map<string, AnnotationEntry[]>();
    for (const set of sets) {
      for (const entry of set.entries) {
        if (!map.has(entry.canvasId)) map.set(entry.canvasId, []);
        map.get(entry.canvasId)!.push(entry);
      }
    }
    return map;
  }, [sets]);

  const needle = query.trim().toLowerCase();
  const shown = needle
    ? canvases.filter((canvas) =>
        (entries.get(canvas.id) ?? []).some((entry) =>
          entry.bodies.some((body) =>
            Clover.toPlainText(body.value ?? "")
              .toLowerCase()
              .includes(needle),
          ),
        ),
      )
    : canvases;

  return (
    <>
      <header className="clover-template-text-header">
        <Clover.Label as="h2" className="clover-template-text-title" />
        {search && (
          <div className="clover-template-text-search">
            <input
              type="search"
              aria-label={t("commonSearch")}
              placeholder={t("commonSearchPlaceholder")}
              value={query}
              onChange={(event) => setQuery(event.target.value)}
            />
            <span role="status" className="clover-template-text-count">
              {needle
                ? shown.length
                  ? `${shown.length} / ${canvases.length}`
                  : t("contentSearchResultsNone")
                : ""}
            </span>
          </div>
        )}
      </header>
      <Clover.Status />
      <ol className="clover-template-text-pages">
        {shown.map((canvas, index) => {
          const columns = byLanguage(entries.get(canvas.id) ?? []);
          const labelId = `${id}-${index}`;
          return (
            <li key={canvas.id}>
              <article
                className="clover-template-text-page"
                aria-labelledby={labelId}
              >
                <figure className="clover-template-text-figure">
                  <button
                    type="button"
                    className="clover-template-text-open"
                    aria-describedby={labelId}
                    aria-label={t("imageViewerOpen")}
                    onClick={() => {
                      goTo(canvas.id);
                      setOpen(true);
                    }}
                  >
                    <Clover.Thumbnail value={canvas} size={400} alt="" />
                  </button>
                  <figcaption>
                    <Clover.Label label={canvas.label} id={labelId} />
                  </figcaption>
                </figure>
                <div
                  className="clover-template-text-columns"
                  style={
                    {
                      "--clover-template-text-columns": columns.length || 1,
                    } as React.CSSProperties
                  }
                >
                  {columns.map(([language, bodies]) => (
                    <div
                      key={language}
                      className="clover-template-text-column"
                      lang={language === "none" ? undefined : language}
                    >
                      {bodies.map((body, n) => (
                        <Clover.Value
                          key={n}
                          as="div"
                          value={{ [language]: [body.value] }}
                          format={body.format}
                        />
                      ))}
                    </div>
                  ))}
                </div>
              </article>
            </li>
          );
        })}
      </ol>
      <Lightbox open={open} onClose={() => setOpen(false)} />
    </>
  );
}
