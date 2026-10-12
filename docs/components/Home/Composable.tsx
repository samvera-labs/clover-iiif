import Link from "next/link";
import React from "react";
import dynamic from "next/dynamic";
import styles from "docs/components/Home/Home.module.css";

/** A long, paged-through volume whose pages have good labels. */
const VOLUME =
  "https://api.dc.library.northwestern.edu/api/v2/works/12531652-50d5-473b-bf1f-ca54c10e875d?as=iiif";

/** The code beside the live example: the same parts, in the same order. */
const CODE = `import * as Clover from "@nulib/clover";
import "@nulib/clover/styles.css";

<Clover.Root
  iiifContent={url}
  className="my-layout"
>
  <Clover.Content />
  <aside>
    <Clover.Label as="h3" />
    <Clover.Label of="canvas" />
  </aside>
  <Clover.Pager />
  <Clover.Items />
</Clover.Root>;`;

/** The live example. `.composed` stands in for the page's own `.my-layout`. */
const Composed = dynamic(
  () =>
    import("@nulib/clover").then(({ Root, Content, Label, Pager, Items }) => {
      function Composed() {
        return (
          <Root iiifContent={VOLUME} className={styles.composed}>
            <Content />
            <aside>
              <Label as="h3" />
              <Label of="canvas" />
            </aside>
            <Pager />
            <Items />
          </Root>
        );
      }
      return Composed;
    }),
  { ssr: false },
);

/** The major parts, each with where it is documented. */
const parts = [
  {
    name: "Root",
    body: "Loads a Manifest, Collection, Canvas or content state, and holds where the reader is. Every part reads from the nearest one.",
    href: "/docs/composing#root",
  },
  {
    name: "Content",
    body: "The view the reader is on, drawn by Clover's own renderer: a page, a spread, a video or a sound.",
    href: "/docs/composing#parts",
  },
  {
    name: "Items",
    body: "Thumbnails of the views, as a carousel, a list or a grid. In a Root they choose the view; on their own they link.",
    href: "/docs/items",
  },
  {
    name: "Pager",
    body: "Previous, Position and Next, a view at a time, in the book's reading direction.",
    href: "/docs/composing#parts",
  },
  {
    name: "InformationPanel",
    body: "About, Collection, Annotations, Contents, Search, Transcript and Map, as tabs or an accordion. Each is a part of its own too.",
    href: "/docs/composing#the-information-panel",
  },
  {
    name: "Label, Summary, Metadata…",
    body: "Each IIIF descriptive property as a part, in the reader's language and sanitised.",
    href: "/docs/composing#properties",
  },
  {
    name: "Split",
    body: "Panes side by side, with a bar between them the reader drags, or moves from the keyboard.",
    href: "/docs/composing#panes-side-by-side",
  },
  {
    name: "Canvas",
    body: "The renderer on its own: deep zoom, video and sound, with or without a Root.",
    href: "/docs/canvas",
  },
  {
    name: "Map",
    body: "Places from navPlace and georeferenced images, on MapLibre, loaded only when a map is shown.",
    href: "/docs/map",
  },
];

/**
 * The homepage's second half: the parts the templates are made of, put together a way
 * of your own, and each part in a line.
 */
const Composable: React.FC = () => (
  <section aria-labelledby="composable" className={styles.contained}>
    <div className={styles.sectionHead}>
      <div>
        <h2 className={styles.sectionTitle} id="composable">
          Compose your own
        </h2>
        <p className={styles.sectionNote}>
          Every template is made of these parts. Place them in markup of your
          own; each reads from the nearest Root.
        </p>
      </div>
      <Link href="/docs/composing" className={styles.sectionLink}>
        Build a layout →
      </Link>
    </div>

    <div className={styles.compose}>
      <pre className={styles.composeCode}>
        <code>{CODE}</code>
      </pre>
      <div className={styles.composeStage}>
        <Composed />
      </div>
    </div>

    <ul className={styles.parts}>
      {parts.map((part) => (
        <li className={styles.feature} key={part.name}>
          <h3 className={styles.partName}>
            <Link href={part.href}>{part.name}</Link>
          </h3>
          <p className={styles.featureBody}>{part.body}</p>
        </li>
      ))}
    </ul>
  </section>
);

export default Composable;
