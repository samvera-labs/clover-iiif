import { Label, Metadata, Summary, Thumbnail } from "src/components/Primitives";

import React from "react";
import { primitiveFixtures } from "docs/lib/demo-resources";
import styles from "docs/components/Playground/PrimitivesPanel.module.css";

/**
 * The Primitives tab of the playground.
 *
 * Unlike the other tabs this is not a single component — it composes four
 * primitives over the same object to show that they take plain IIIF properties and
 * nothing else. All values are inline, so there is no fetch and no resource picker.
 */
const PrimitivesPanel: React.FC = () => (
  <div className={styles.grid}>
    <div className={styles.thumb}>
      <Thumbnail thumbnail={primitiveFixtures.thumbnail} />
    </div>
    <div className={styles.stack}>
      <div className={styles.label}>
        <Label label={primitiveFixtures.label} />
      </div>
      <div className={styles.summary}>
        <Summary summary={primitiveFixtures.summary} />
      </div>
      <div className={styles.metadata}>
        <Metadata metadata={primitiveFixtures.metadata} />
      </div>
    </div>
    <p className={styles.names}>
      Label · Summary · Metadata · Thumbnail · PartOf · SeeAlso · Rendering ·
      RequiredStatement · Homepage
    </p>
  </div>
);

export default PrimitivesPanel;
