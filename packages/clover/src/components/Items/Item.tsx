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

/**
 * A part's thumbnail URL: at once for a sizeable service, after `info.json` for level 0.
 * `none` when the resource has no image to ask for at all (sound with no picture).
 */
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
  return { src, none: !source };
}

/**
 * A speaker, for sound with nothing to picture. Its own, not the player's icon: sharing
 * that module would bring every player icon up front with the thumbnails.
 */
const Speaker = () => (
  <svg aria-hidden="true" focusable="false" viewBox="0 0 512 512">
    <path d="M232 416a24 24 0 01-14.9-5.2L125.8 336H56a24 24 0 01-24-24V200a24 24 0 0124-24h69.8l91.3-74.8A24 24 0 01256 120v272a24 24 0 01-24 24z" />
    <path
      d="M336 176a112 112 0 010 160M384 128a176 176 0 010 256"
      fill="none"
      stroke="currentColor"
      strokeLinecap="round"
      strokeWidth="32"
    />
  </svg>
);

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
  const { src, none } = useThumbnail(part, size, request);
  const [loaded, setLoaded] = useState(false);
  /*
   * The Canvas's own shape, as the image's width and height attributes, so its card has
   * its width before the thumbnail arrives: no shift as it loads, and a strip never
   * holds hundreds of zero-wide cards (all "in view", all fetched). Square where the
   * resource has no size (sound, a Collection's member) until its image arrives.
   */
  const { width, height } = (part.resource ?? {}) as {
    width?: number;
    height?: number;
  };
  const ratio = width && height ? width / height : 1;
  /*
   * Nothing to show yet, or ever (sound with no picture): the picture keeps the box an
   * image would have, so its cell does not collapse to its caption. Sound says so.
   */
  return (
    <span
      className="clover-items-picture"
      data-loaded={loaded}
      data-empty={src ? undefined : true}
      style={
        src
          ? undefined
          : ({ "--clover-items-ratio": ratio } as React.CSSProperties)
      }
    >
      {!src && none && part.media === "Sound" && <Speaker />}
      {src && (
        <img
          src={src}
          alt={alt}
          // Sized here so a picture never fills its container without the stylesheet.
          width={size}
          height={Math.round(size / ratio)}
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
 * An item as a figure: a card for each of its Canvases (two, side by side, for a spread;
 * all of them for a continuous Manifest), each its picture with its own label under it,
 * and a duration for video and sound. The Manifest's `behavior` decides what one item
 * holds, so the cards of one item meet with no gap between them, labels and all.
 *
 * The pictures and the labels are in rows of the figure's grid (one column per Canvas),
 * the labels in its `figcaption`. Without the stylesheet the labels read inline, a space
 * between them. A picture's `alt` is empty when its label already names it, so a screen
 * reader does not read it twice.
 */
export function ItemFigure({
  item,
  size,
  language,
  request,
  showSummary = false,
}: ItemFigureProps) {
  const labels = item.parts.map((part) =>
    localize(item.parts.length === 1 ? item.label : part.label, language),
  );
  const summary = showSummary ? localize(item.summary, language) : null;
  const labelled = labels.some((label) => label.text);
  return (
    <figure
      className="clover-items-figure"
      data-parts={item.parts.length}
      data-media={item.parts[0]?.media?.toLowerCase()}
      style={{ "--parts": item.parts.length } as React.CSSProperties}
    >
      <span className="clover-items-pictures">
        {item.parts.map((part, index) => (
          <Picture
            key={part.id}
            part={part}
            size={size}
            request={request}
            alt={labels[index].text ? "" : localize(part.label, language).text}
          />
        ))}
      </span>
      {(labelled || summary?.text) && (
        <figcaption className="clover-items-caption">
          {labels.map((label, index) => (
            <span
              key={item.parts[index].id}
              className="clover-items-label"
              lang={label.lang}
            >
              {/* Inline without the stylesheet; a grid cell trims it with it. */}
              {index > 0 && " "}
              {label.text}
            </span>
          ))}
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
