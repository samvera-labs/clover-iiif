import * as Clover from "@nulib/clover";
import React, { Suspense, lazy, useMemo, useState } from "react";
import Link from "next/link";
import { resourceByKey } from "docs/components/Playground/playground-config";
import styles from "docs/components/Home/Parts.module.css";
import { useMapWorker } from "docs/lib/map-worker";

/**
 * The playground's resource, taken apart (`Parts.tsx` is the section around it). One
 * `Root` holds it; on the left its parts make a small viewer, and on the right each part
 * stands on its own, live, named, with the property it reads and what the resource has
 * there. Choosing in one part moves the others, since they read the same Root. Pointing
 * at a part outlines it in the viewer.
 *
 * Nothing here is made up: every value shown is the resource's own, read as Clover reads
 * it. A part the resource gives nothing to is a chip at the end, naming what it would
 * read, and the playground resource that has it.
 */

const MapPart = lazy(() =>
  import("@nulib/clover/map").then((map) => ({ default: map.Map })),
);

type Json = Record<string, any>;

type PartKey =
  | "label"
  | "thumbnail"
  | "content"
  | "items"
  | "summary"
  | "metadata"
  | "requiredStatement"
  | "rights"
  | "homepage"
  | "seeAlso"
  | "partOf"
  | "id"
  | "annotations"
  | "map"
  | "contents"
  | "search"
  | "transcript"
  | "download";

const asArray = (value: unknown): any[] =>
  Array.isArray(value) ? value : value == null ? [] : [value];

/** A language map's first value, in whichever language it has one. */
function first(map: unknown): string | undefined {
  if (!map || typeof map !== "object") return undefined;
  for (const list of Object.values(map as Record<string, unknown>)) {
    const value = asArray(list).find((item) => typeof item === "string");
    if (value) return value;
  }
  return undefined;
}

/** A rights statement's or licence's short name: `…/vocab/InC/1.0/` is "InC 1.0". */
function rightsName(uri: unknown): string | undefined {
  if (typeof uri !== "string") return undefined;
  try {
    return new URL(uri).pathname.split("/").filter(Boolean).slice(-2).join(" ");
  } catch {
    return uri;
  }
}

/** What a Canvas paints first: `Image`, `Video` or `Sound`. */
function paints(canvas: Json | null): string | undefined {
  for (const page of asArray(canvas?.items)) {
    for (const annotation of asArray(page?.items)) {
      let body = asArray(annotation?.body)[0];
      if (body?.type === "Choice") body = asArray(body.items)[0];
      if (body?.type === "SpecificResource") body = body.source;
      if (body?.type) return body.type;
    }
  }
  return undefined;
}

/** A Canvas's painting annotations that target a time: an animation's frames. */
const framesOf = (canvas: Json | null) =>
  asArray(canvas?.items)
    .flatMap((page) => asArray(page?.items))
    .filter((annotation) =>
      /#t=/.test(String(annotation?.target?.id ?? annotation?.target ?? "")),
    ).length;

/** Captions on any Canvas: what `Transcript` reads. */
const hasCaptions = (canvases: Json[]) =>
  canvases.some((canvas) =>
    [...asArray(canvas.annotations), ...asArray(canvas.items)]
      .flatMap((page) => asArray(page?.items))
      .flatMap((annotation) => asArray(annotation?.body))
      .some(
        (body) =>
          body?.format === "text/vtt" || /\.vtt(\?|$)/i.test(String(body?.id)),
      ),
  );

/** The places a resource has: `navPlace` features on it and its Canvases. */
const placesOf = (manifest: Json, canvases: Json[]) =>
  [manifest, ...canvases].reduce(
    (count, resource) => count + asArray(resource?.navPlace?.features).length,
    0,
  );

/**
 * For each conditional part, a playground resource that gives it something: the chips
 * offer it. Read from the resources themselves; none of them has a table of contents, a
 * search service, captions or downloads.
 */
const SHOWN_IN: Partial<Record<PartKey, string>> = {
  summary: "collection",
  metadata: "collection",
  requiredStatement: "collection",
  rights: "collection",
  homepage: "collection",
  seeAlso: "collection",
  partOf: "collection",
  items: "catalog",
  annotations: "print",
  map: "map",
};

/** Where each part is documented. */
const DOCS = {
  composing: "/docs/composing#parts",
  properties: "/docs/composing#properties",
  panel: "/docs/composing#the-information-panel",
  items: "/docs/items",
  map: "/docs/map",
};

interface PartSpec {
  key: PartKey;
  /** The component, as it is written: `Clover.Label`. */
  name: string;
  /** The property it reads. */
  reads: string;
  href: string;
  /** What the resource has there, if anything: a count, a size, a name. */
  fact?: string;
  /** Whether the resource gives it anything to show. */
  present: boolean;
  /** Its share of the grid's six columns, and whether it runs tall. */
  span: 2 | 3 | 4 | 6;
  tall?: boolean;
  body: React.ReactNode;
}

export default function PartsLive({
  resource,
  onTry,
}: {
  resource: string;
  onTry: (key: string) => void;
}) {
  return (
    <Clover.Root iiifContent={resource} key={resource} className={styles.root}>
      <Exploded onTry={onTry} />
    </Clover.Root>
  );
}

function Exploded({ onTry }: { onTry: (key: string) => void }) {
  const manifest = Clover.useManifest() as Json | null;
  const { canvases, views, direction } = Clover.useSequence();
  const active = Clover.useActiveCanvas() as Json | null;
  const sets = Clover.useAnnotationSets();
  const collection = Clover.useCloverSelector(
    (state) => state.collection,
  ) as Json | null;
  const [pointed, setPointed] = useState<PartKey | null>(null);

  const parts = useMemo<PartSpec[]>(() => {
    if (!manifest) return [];
    const all = canvases as Json[];
    const entries = sets.flatMap((set) => set.entries);
    const georeferences = entries.filter((entry) =>
      entry.motivation.includes("georeferencing"),
    ).length;
    const notes = entries.filter(
      (entry) => !entry.motivation.includes("georeferencing"),
    );
    const motivations = [
      ...new Set(notes.flatMap((entry) => entry.motivation)),
    ].join(", ");
    const places = placesOf(manifest, all);
    const frames = framesOf(active);
    const size =
      active?.width && active?.height
        ? `${active.width} × ${active.height}`
        : undefined;
    const partOf = first(asArray(manifest.partOf)[0]?.label);
    const members = asArray(collection?.items).length;
    const count = (n: number, one: string, many = `${one}s`) =>
      `${n} ${n === 1 ? one : many}`;
    // Items moves between views, so a single view gives it nothing.
    const several = views.length > 1;

    return [
      {
        key: "label",
        name: "Label",
        reads: "label",
        present: Boolean(first(manifest.label)),
        span: 4,
        href: DOCS.composing,
        body: <Clover.Label as="p" className={styles.display} />,
      },
      {
        key: "thumbnail",
        name: "Thumbnail",
        reads: manifest.thumbnail ? "thumbnail" : "items[0]",
        present: true,
        span: 2,
        href: DOCS.properties,
        body: <Clover.Thumbnail alt="" size={400} className={styles.thumb} />,
      },
      {
        key: "content",
        name: "Content",
        reads: "items",
        fact: [
          first(active?.label),
          size,
          paints(active),
          frames > 1 ? count(frames, "frame") : undefined,
        ]
          .filter(Boolean)
          .join(" · "),
        present: true,
        span: 6,
        tall: true,
        href: DOCS.composing,
        body: <Clover.Content className={styles.stage} />,
      },
      {
        key: "items",
        name: "Items",
        // The Canvases, grouped into views by `behavior`, laid out by `viewingDirection`.
        reads: "items, behavior, viewingDirection",
        fact: [
          count(views.length, "view"),
          [...new Set(asArray(manifest.behavior))].join(", "),
          direction,
        ]
          .filter(Boolean)
          .join(" · "),
        present: several,
        span: 6,
        href: DOCS.items,
        body: <Clover.Items className={styles.strip} />,
      },
      {
        key: "summary",
        name: "Summary",
        reads: "summary",
        present: Boolean(first(manifest.summary)),
        span: 6,
        href: DOCS.properties,
        body: <Clover.Summary />,
      },
      {
        key: "metadata",
        name: "Metadata",
        reads: "metadata",
        fact: count(asArray(manifest.metadata).length, "field"),
        present: asArray(manifest.metadata).length > 0,
        span: 6,
        href: DOCS.properties,
        body: <Clover.Metadata className={styles.fields} />,
      },
      {
        key: "partOf",
        name: "Collection",
        reads: "partOf",
        fact: collection ? count(members, "member") : undefined,
        present: Boolean(partOf || collection),
        span: 6,
        href: DOCS.composing,
        // What the InformationPanel's Collection section shows, as the part it is.
        body: (
          <Clover.Collection
            headingLevel={4}
            className={`${styles.scroll} ${styles.tall}`}
          />
        ),
      },
      {
        key: "homepage",
        name: "Homepage",
        reads: "homepage",
        present: asArray(manifest.homepage).length > 0,
        span: 3,
        href: DOCS.properties,
        body: <Clover.Homepage className={styles.links} />,
      },
      {
        key: "seeAlso",
        name: "SeeAlso",
        reads: "seeAlso",
        fact: count(asArray(manifest.seeAlso).length, "link"),
        present: asArray(manifest.seeAlso).length > 0,
        span: 3,
        href: DOCS.properties,
        body: <Clover.SeeAlso className={styles.links} />,
      },
      {
        key: "id",
        name: "Id",
        reads: "id",
        fact: manifest.type,
        present: true,
        span: 3,
        href: DOCS.properties,
        body: <Clover.Id className={styles.links} />,
      },
      {
        key: "rights",
        name: "Rights",
        reads: "rights",
        fact: rightsName(manifest.rights),
        present: Boolean(manifest.rights),
        span: 3,
        href: DOCS.properties,
        body: <Clover.Rights className={styles.small} />,
      },
      {
        key: "requiredStatement",
        name: "RequiredStatement",
        reads: "requiredStatement",
        fact: first(manifest.requiredStatement?.label),
        present: Boolean(first(manifest.requiredStatement?.value)),
        span: 6,
        href: DOCS.properties,
        body: <Clover.RequiredStatement className={styles.statement} />,
      },
      {
        key: "annotations",
        name: "Annotations",
        reads: "annotations",
        fact: [count(notes.length, "annotation"), motivations]
          .filter(Boolean)
          .join(" · "),
        present: notes.length > 0,
        span: 6,
        href: DOCS.panel,
        body: <Clover.Annotations className={styles.scroll} />,
      },
      {
        key: "map",
        name: "Map",
        reads: "navPlace",
        fact: [
          places ? count(places, "place") : undefined,
          georeferences ? count(georeferences, "georeference") : undefined,
        ]
          .filter(Boolean)
          .join(" · "),
        present: places > 0 || georeferences > 0,
        span: 6,
        tall: true,
        href: DOCS.map,
        body: <MapTile />,
      },
      {
        key: "contents",
        name: "Contents",
        reads: "structures",
        fact: count(asArray(manifest.structures).length, "range"),
        present: asArray(manifest.structures).length > 0,
        span: 3,
        href: DOCS.panel,
        body: <Clover.Contents className={styles.scroll} />,
      },
      {
        key: "search",
        name: "Search",
        reads: "service",
        present: Boolean(Clover.searchServiceOf(manifest as never)),
        span: 3,
        href: DOCS.panel,
        body: <Clover.Search />,
      },
      {
        key: "transcript",
        name: "Transcript",
        reads: "WebVTT captions",
        present: hasCaptions(all),
        span: 3,
        href: DOCS.panel,
        body: <Clover.Transcript className={styles.scroll} />,
      },
      {
        key: "download",
        name: "Download",
        reads: "rendering",
        present:
          asArray(manifest.rendering).length > 0 ||
          all.some((canvas) => asArray(canvas.rendering).length > 0),
        span: 3,
        href: DOCS.panel,
        body: <Clover.Download />,
      },
    ];
  }, [manifest, canvases, views, direction, active, sets, collection]);

  if (!manifest) {
    return (
      <>
        <div className={styles.assembled} aria-hidden="true" />
        <Clover.Status className={styles.loading} />
      </>
    );
  }

  // Pointing at a part, or focusing in it, outlines it in the viewer, and back.
  const point = (key: PartKey) => ({
    "data-on": pointed === key || undefined,
    onPointerEnter: () => setPointed(key),
    onPointerLeave: () => setPointed(null),
    onFocus: () => setPointed(key),
    onBlur: () => setPointed(null),
  });
  const shown = parts.filter((part) => part.present);
  const missing = parts.filter((part) => !part.present);

  return (
    <>
      <div className={styles.assembled}>
        <p className={styles.caption}>
          <code>{"<Clover.Root />"}</code>
          <span>
            {collection ? `${manifest.type}, in a Collection` : manifest.type}
          </span>
        </p>
        <div className={styles.viewer}>
          <div className={styles.viewerHead}>
            <Region name="Thumbnail" {...point("thumbnail")}>
              <Clover.Thumbnail
                alt=""
                size={128}
                className={styles.viewerThumb}
              />
            </Region>
            <Region name="Label" {...point("label")}>
              <Clover.Label as="h3" className={styles.viewerTitle} />
            </Region>
          </div>
          <Region name="Content" {...point("content")}>
            <Clover.Content className={styles.viewerStage} />
          </Region>
          {shown.some((part) => part.key === "items") && (
            <div className={styles.viewerRail}>
              <Region name="Items" {...point("items")}>
                <Clover.Items className={styles.viewerStrip} />
              </Region>
            </div>
          )}
          {shown.some(
            (part) => part.key === "summary" || part.key === "metadata",
          ) && (
            <div className={styles.viewerAbout}>
              <Region name="Summary" {...point("summary")}>
                <Clover.Summary className={styles.viewerSummary} />
              </Region>
              <Region name="Metadata" {...point("metadata")}>
                <Clover.Metadata className={styles.viewerFields} />
              </Region>
            </div>
          )}
        </div>
      </div>

      <div className={styles.tiles}>
        {shown.map((part) => (
          <section
            key={part.key}
            aria-labelledby={`part-${part.key}`}
            className={styles.tile}
            data-span={part.span}
            data-tall={part.tall || undefined}
            {...point(part.key)}
          >
            <header className={styles.tileHead}>
              <h3 id={`part-${part.key}`} className={styles.tileName}>
                <Link href={part.href}>{`<Clover.${part.name} />`}</Link>
              </h3>
              <span className={styles.reads}>{part.reads}</span>
              {part.fact && <span className={styles.fact}>{part.fact}</span>}
            </header>
            <div className={styles.tileBody}>{part.body}</div>
          </section>
        ))}
      </div>

      {missing.length > 0 && (
        <div className={styles.missing}>
          <p className={styles.missingTitle}>
            Nothing for these in this resource
          </p>
          <ul className={styles.chips}>
            {missing.map((part) => {
              const elsewhere = SHOWN_IN[part.key];
              const name = elsewhere && resourceByKey(elsewhere)?.name;
              return (
                <li key={part.key} className={styles.chip}>
                  <Link href={part.href} className={styles.chipName}>
                    {`<Clover.${part.name} />`}
                  </Link>
                  <span className={styles.reads}>{part.reads}</span>
                  {name && (
                    <button
                      type="button"
                      className={styles.try}
                      onClick={() => onTry(elsewhere)}
                    >
                      {name} →
                    </button>
                  )}
                </li>
              );
            })}
          </ul>
        </div>
      )}
    </>
  );
}

/**
 * A part in the assembled viewer: outlined, its name shown, while its tile is pointed at.
 */
function Region({
  name,
  children,
  ...rest
}: {
  name: string;
  children: React.ReactNode;
} & React.HTMLAttributes<HTMLDivElement> & { "data-on"?: boolean }) {
  return (
    <div className={styles.region} {...rest}>
      <span className={styles.regionName} aria-hidden="true">
        {name}
      </span>
      {children}
    </div>
  );
}

/** The map's part, once MapLibre's worker is set: loaded only for a resource with places. */
function MapTile() {
  const ready = useMapWorker(true);
  return (
    <div className={styles.map}>
      {ready && (
        <Suspense fallback={null}>
          <MapPart />
        </Suspense>
      )}
    </div>
  );
}
