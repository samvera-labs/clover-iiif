import Hero from "docs/components/Home/Hero";
import Link from "next/link";
import Playground from "docs/components/Playground/Playground";
import React from "react";
import styles from "docs/components/Home/Home.module.css";

const features = [
  {
    label: "Accessible",
    title: "WAI-ARIA design patterns",
    body: "Keyboard navigation, focus, and motion preferences ship with every component.",
  },
  {
    label: "Composable",
    title: "Primitives, not just a viewer",
    body: "Take the whole Viewer, or build your own from the primitives.",
  },
  {
    label: "Themeable",
    title: "Uses your design tokens",
    body: "Every component reads CSS custom properties. Set one on any ancestor; it cascades.",
  },
  {
    label: "Portable",
    title: "React, or a script tag",
    body: "ESM, CJS, and a UMD web component. Drop it into a framework or plain HTML.",
  },
];

/**
 * The homepage.
 *
 * Rendered from a thin `pages/index.mdx` shell rather than being a `pages/*.tsx`
 * route of its own: a plain Next page bypasses Nextra's layout entirely, which
 * takes the navbar, search, theme toggle and banner with it. Going through MDX with
 * `theme.layout: "raw"` (set in `pages/_meta.json`) keeps that chrome while giving
 * this component the full content area.
 *
 * The interactive showcase is the `<Playground/>` section — there is no separate
 * `/playground` route and no grid of preview cards, because both were showing the
 * same components live.
 */
const Homepage: React.FC = () => (
  <div className={styles.page}>
    <Hero />

    <main className={styles.shell}>
      <Playground />

      <div className={styles.sectionHead}>
        <div>
          <h2 className={styles.sectionTitle}>Why Clover</h2>
          <p className={styles.sectionNote}>
            Built for IIIF Presentation 3.0, from the primitives up.
          </p>
        </div>
        <Link href="/docs" className={styles.sectionLink}>
          Read the docs →
        </Link>
      </div>

      <div className={styles.features}>
        {features.map((feature) => (
          <div className={styles.feature} key={feature.label}>
            <p className={styles.featureLabel}>{feature.label}</p>
            <h3 className={styles.featureTitle}>{feature.title}</h3>
            <p className={styles.featureBody}>{feature.body}</p>
          </div>
        ))}
      </div>

      <div className={styles.sectionHead}>
        <h2 className={styles.sectionTitle}>Install</h2>
      </div>

      <div className={styles.install}>
        <code className={styles.installCode}>
          npm install @samvera/clover-iiif
        </code>
        <Link href="/docs" className="cta-solid">
          Get started
          <span className="cta-arrow" aria-hidden="true">
            →
          </span>
        </Link>
      </div>
    </main>
  </div>
);

export default Homepage;
