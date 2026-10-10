import React, { useEffect, useState } from "react";

import type { ItemModel, ItemPart } from "../../core/items";
import type { CloverRequest } from "../../core/request";
import { resolveThumbnail, thumbnailSource } from "../../core/thumbnail";
import { localize } from "../../core/value";

/** `h:mm:ss`, or `m:ss` under an hour. */
export function formatDuration(seconds: number): string {
  const total = Math.max(0, Math.round(seconds));
  const h = Math.floor(total / 3600);
  const m = Math.floor((total % 3600) / 60);
  const s = String(total % 60).padStart(2, "0");
  return h ? `${h}:${String(m).padStart(2, "0")}:${s}` : `${m}:${s}`;
}

/** A part's thumbnail URL: at once for a sizeable service, after `info.json` for level 0. */
function useThumbnail(
  part: ItemPart,
  size: number,
  request: CloverRequest | undefined,
) {
  const source = thumbnailSource(part.resource, size);
  const [src, setSrc] = useState(source?.src);
  const key = source?.src ?? source?.service ?? source?.fallback;
  useEffect(() => {
    if (!source) return setSrc(undefined);
    if (source.src) return setSrc(source.src);
    let current = true;
    resolveThumbnail(source, size, request).then((url) => {
      if (current) setSrc(url);
    });
    return () => {
      current = false;
    };
    // `key` stands in for `source`, a new object each render.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key, size]);
  return src;
}

function Picture({
  part,
  size,
  request,
  alt,
}: {
  part: ItemPart;
  size: number;
  request?: CloverRequest;
  alt: string;
}) {
  const src = useThumbnail(part, size, request);
  const [loaded, setLoaded] = useState(false);
  return (
    <span className="clover-items-picture" data-loaded={loaded}>
      {src && (
        <img
          src={src}
          alt={alt}
          // Sized here so a picture never fills its container without the stylesheet.
          width={size}
          loading="lazy"
          decoding="async"
          draggable={false}
          onLoad={() => setLoaded(true)}
          onError={() => setLoaded(true)}
        />
      )}
      {part.duration ? (
        <span className="clover-items-duration">
          {formatDuration(part.duration)}
        </span>
      ) : null}
    </span>
  );
}

export interface ItemFigureProps {
  item: ItemModel;
  size: number;
  language?: string;
  request?: CloverRequest;
  /** Show the item's summary below its label (a Collection's members have them). */
  showSummary?: boolean;
}

/**
 * An item as a figure: its picture (two, side by side, for a spread), a duration for
 * video and sound, and its label. The pictures' `alt` is empty when the label beside them
 * already names the item, so a screen reader does not read it twice.
 */
export function ItemFigure({
  item,
  size,
  language,
  request,
  showSummary = false,
}: ItemFigureProps) {
  const label = localize(item.label, language);
  const summary = showSummary ? localize(item.summary, language) : null;
  return (
    <figure
      className="clover-items-figure"
      data-parts={item.parts.length}
      data-media={item.parts[0]?.media?.toLowerCase()}
    >
      <span className="clover-items-pictures">
        {item.parts.map((part) => (
          <Picture
            key={part.id}
            part={part}
            size={size}
            request={request}
            alt={label.text ? "" : localize(part.label, language).text}
          />
        ))}
      </span>
      {(label.text || summary?.text) && (
        <figcaption className="clover-items-caption">
          {label.text && (
            <span className="clover-items-label" lang={label.lang}>
              {label.text}
            </span>
          )}
          {summary?.text && (
            <span className="clover-items-summary" lang={summary.lang}>
              {/* IIIF allows a little HTML here; shown as text, its tags go. */}
              {summary.text.replace(/<[^>]*>/g, "")}
            </span>
          )}
        </figcaption>
      )}
    </figure>
  );
}
