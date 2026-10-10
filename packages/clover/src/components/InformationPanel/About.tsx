import React from "react";

import { useCloverTranslation } from "../../i18n/useCloverTranslation";
import { join } from "../../lib/classnames";
import { useCloverSelector } from "../../react/context";
import {
  Homepage,
  Id,
  Metadata,
  Rendering,
  RequiredStatement,
  Rights,
  SeeAlso,
  Summary,
  Thumbnail,
} from "../Primitives/Primitives";

export interface AboutProps extends React.HTMLAttributes<HTMLElement> {
  /** Also show the current Canvas's summary, for Manifests that describe each image. */
  canvasSummary?: boolean;
  /** The heading level for each section's title. Default 3. */
  headingLevel?: 2 | 3 | 4 | 5 | 6;
}

/**
 * Everything the Manifest says about itself, in the order 3.x's About tab shows it:
 * thumbnail, summary, metadata, required statement, rights, homepage, see also,
 * alternate formats, and the Manifest's own address. Each part renders only if the
 * Manifest has it.
 */
export function About({
  canvasSummary = false,
  headingLevel = 3,
  className,
  ...rest
}: AboutProps) {
  const { t } = useCloverTranslation();
  const manifest = useCloverSelector(
    (state) => state.manifest as Record<string, any> | null,
    Object.is,
    "About",
  );
  if (!manifest) return null;
  const Heading = `h${headingLevel}` as React.ElementType;
  const section = (title: string, has: unknown, part: React.ReactNode) =>
    has ? (
      <section className="clover-about-section">
        <Heading className="clover-about-heading">{title}</Heading>
        {part}
      </section>
    ) : null;
  const hasAny = (key: string) =>
    Array.isArray(manifest[key])
      ? manifest[key].length > 0
      : Boolean(manifest[key]);

  return (
    <div className={join("clover-about", className)} {...rest}>
      <Thumbnail className="clover-about-thumbnail" size={400} />
      {canvasSummary && (
        <Summary of="canvas" className="clover-about-summary" />
      )}
      <Summary className="clover-about-summary" />
      <Metadata className="clover-about-metadata" />
      <RequiredStatement className="clover-about-metadata" />
      {section(t("aboutRights"), manifest.rights, <Rights />)}
      {section(t("aboutHomepage"), hasAny("homepage"), <Homepage />)}
      {section(t("aboutSeeAlso"), hasAny("seeAlso"), <SeeAlso />)}
      {section(t("aboutRendering"), hasAny("rendering"), <Rendering />)}
      {section(t("aboutManifest"), manifest.id, <Id />)}
    </div>
  );
}
