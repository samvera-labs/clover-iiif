import CallToAction from "docs/components/CallToAction";
import React from "react";
import styles from "./HomepageHeader.module.css";

const HomepageHeader: React.FC = () => {
  return (
    <div className={styles.wrapper}>
      <div className={styles.header}>
        <h1 className={styles.headline}>
          Showcase IIIF Manifests <br />
          as interoperable web content.
        </h1>
        <p className={styles.subtitle}>
          Extensible IIIF front-end toolkit and Manifest viewer. Accessible.
          Composable. Open Source.
        </p>
        <CallToAction href="/docs" text="Get Started" />
      </div>
      <div
        className={`${styles.gradient} nx-bg-gray-100 nx-pb-[env(safe-area-inset-bottom)] dark:nx-bg-neutral-900 print:nx-bg-transparent`}
      />
    </div>
  );
};

export default HomepageHeader;
