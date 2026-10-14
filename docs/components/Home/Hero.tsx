import React from "react";
import styles from "docs/components/Home/Home.module.css";

/**
 * The hero: the page's headline, and the sentence that says what Clover does.
 *
 * No call-to-action buttons. The playground sits directly below and is itself the
 * invitation, so a "Try the components" link pointed at something already on screen,
 * and "Get started" duplicated both the navbar's Documentation link and the button on
 * the install panel further down.
 */
const Hero: React.FC = () => (
  <header className={styles.hero}>
    <div className={styles.shell}>
      <h1 className={styles.headline}>
        Create <span className={styles.mark}>your own</span> viewer.
      </h1>
      <p className={styles.subtitle}>
        Share your distinctive collections through an accessible and curated
        viewer designed for your IIIF Manifests and Collections.
      </p>
    </div>
  </header>
);

export default Hero;
