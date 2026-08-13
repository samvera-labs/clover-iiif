import React from "react";
import styles from "docs/components/Home/Home.module.css";

/**
 * The hero: version, headline, subtitle.
 *
 * No call-to-action buttons. The playground sits directly below and is itself the
 * invitation, so a "Try the components" link pointed at something already on screen,
 * and "Get started" duplicated both the navbar's Documentation link and the button on
 * the install panel further down.
 */
const Hero: React.FC = () => (
  <header className={styles.hero}>
    <div className={styles.glow} aria-hidden="true" />
    <div className={styles.shell}>
      <p className={styles.eyebrow}>
        <strong>v3.12</strong>
      </p>
      <h1 className={styles.headline}>
        Build interfaces for IIIF content from a suite of UI components.
      </h1>
      <p className={styles.subtitle}>
        Accessible, composable, open source &mdash; created at Northwestern
        University Libraries.
      </p>
    </div>
  </header>
);

export default Hero;
