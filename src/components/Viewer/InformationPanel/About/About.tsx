import { AboutContent } from "src/components/Viewer/InformationPanel/About/About.styled";
import {
  ContentResource,
  IIIFExternalWebResource,
  ManifestNormalized,
} from "@iiif/presentation-3";
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
} from "src/components/Viewer/Properties";
import React, { useEffect, useState } from "react";
import { ViewerContextStore, useViewerState } from "src/context/viewer-context";

import { PrimitivesExternalWebResource } from "src/types/primitives";

const About: React.FC = () => {
  const viewerState: ViewerContextStore = useViewerState();
  const { activeManifest, vault } = viewerState;

  const [manifest, setManifest] = useState<ManifestNormalized>();

  const [homepage, setHomepage] = useState<PrimitivesExternalWebResource[]>([]);
  const [seeAlso, setSeeAlso] = useState<PrimitivesExternalWebResource[]>([]);
  const [rendering, setRendering] = useState<PrimitivesExternalWebResource[]>(
    [],
  );
  const [thumbnail, setThumbnail] = useState<IIIFExternalWebResource[]>([]);

  useEffect(() => {
    const data: ManifestNormalized = vault.get(activeManifest);
    setManifest(data);

    if (data.homepage?.length > 0)
      setHomepage(
        vault.get(
          data.homepage,
        ) as ContentResource[] as PrimitivesExternalWebResource[],
      );
    if (data.seeAlso?.length > 0)
      setSeeAlso(
        vault.get(
          data.seeAlso,
        ) as ContentResource[] as PrimitivesExternalWebResource[],
      );
    if (data.rendering?.length > 0)
      setRendering(
        vault.get(
          data.rendering,
        ) as ContentResource[] as PrimitivesExternalWebResource[],
      );
    if (data.thumbnail?.length > 0)
      setThumbnail(
        vault.get(
          data.thumbnail,
        ) as ContentResource[] as IIIFExternalWebResource[],
      );
  }, [activeManifest, vault]);

  if (!manifest) return <></>;

  return (
    <AboutContent>
      <Thumbnail thumbnail={thumbnail} label={manifest.label} />
      <Summary summary={manifest.summary} />
      <Metadata metadata={manifest.metadata} />
      <RequiredStatement requiredStatement={manifest.requiredStatement} />
      <Rights rights={manifest.rights} />
      <Homepage homepage={homepage} />
      <SeeAlso seeAlso={seeAlso} />
      <Rendering rendering={rendering} />
      <Id id={manifest.id} htmlLabel="IIIF Manifest" />
    </AboutContent>
  );
};

export default About;
