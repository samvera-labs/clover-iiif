import {
  AboutContent,
  AboutStyled,
} from "src/components/Viewer/InformationPanel/About/About.styled";
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
  const { activeManifest, vault, configOptions } = viewerState;
  const { language } = configOptions;

  const [manifest, setManifest] = useState<ManifestNormalized>();

  const [homepage, setHomepage] = useState<PrimitivesExternalWebResource[]>([]);
  const [seeAlso, setSeeAlso] = useState<PrimitivesExternalWebResource[]>([]);
  const [rendering, setRendering] = useState<PrimitivesExternalWebResource[]>(
    [],
  );
  const [thumbnail, setThumbnail] = useState<IIIFExternalWebResource[]>([]);

  useEffect(() => {
    const data: ManifestNormalized = vault.get(activeManifest);

    if (!data) return;

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
    <AboutStyled>
      <AboutContent>
        <Thumbnail thumbnail={thumbnail} label={manifest.label} language={language} />
        <Summary summary={manifest.summary} language={language} />
        <Metadata metadata={manifest.metadata} language={language} />
        <RequiredStatement requiredStatement={manifest.requiredStatement} language={language} />
        <Rights rights={manifest.rights} />
        <Homepage homepage={homepage} />
        <SeeAlso seeAlso={seeAlso} />
        <Rendering rendering={rendering} />
        <Id id={manifest.id} htmlLabel="IIIF Manifest" />
      </AboutContent>
    </AboutStyled>
  );
};

export default About;
