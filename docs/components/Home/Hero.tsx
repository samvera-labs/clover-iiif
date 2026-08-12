import Link from "next/link";
import React from "react";
import styles from "docs/components/Home/Home.module.css";

interface HeroProps {
  /** Same-page anchor to the playground section. */
  stageHref: string;
}

const Hero: React.FC<HeroProps> = ({ stageHref }) => (
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
      <div className={styles.actions}>
        <Link href="/docs" className="cta-solid">
          Get started
          <span className="cta-arrow" aria-hidden="true">
            →
          </span>
        </Link>
        {/* A same-page anchor, so a plain <a> rather than next/link. */}
        <a href={stageHref} className="cta-soft">
          Try the components
          <span className="cta-arrow" aria-hidden="true">
            ↓
          </span>
        </a>
      </div>
    </div>
  </header>
);

export default Hero;
