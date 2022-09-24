import { useViewerState } from "@/context/viewer-context";
import {
  IIIFExternalWebResource,
  InternationalString,
  ManifestNormalized,
} from "@iiif/presentation-3";
import { Metadata, RequiredStatement, Summary } from "@samvera/nectar-iiif";
import { NectarExternalWebResource } from "@samvera/nectar-iiif/dist/types/nectar";
import React, { useEffect, useState } from "react";
import {
  AboutContent,
  AboutStyled,
} from "@/components/Navigator/About/About.styled";
import { Homepage, Rights, SeeAlso, Thumbnail } from "@/components/Properties";

const About: React.FC = () => {
  const viewerState: any = useViewerState();
  const { activeManifest, vault } = viewerState;

  const [manifest, setManifest] = useState<ManifestNormalized>();

  const [homepage, setHomepage] = useState<IIIFExternalWebResource[]>([]);
  const [seeAlso, setSeeAlso] = useState<IIIFExternalWebResource[]>([]);
  const [thumbnail, setThumbnail] = useState<IIIFExternalWebResource[]>([]);

  useEffect(() => {
    const data = vault.get(activeManifest);
    setManifest(data);

    if (data.homepage?.length > 0) setHomepage(vault.get(data.homepage));
    if (data.seeAlso?.length > 0) setSeeAlso(vault.get(data.seeAlso));
    if (data.thumbnail?.length > 0) setThumbnail(vault.get(data.thumbnail));
  }, [activeManifest, vault]);

  if (!manifest) return <></>;

  return (
    <AboutStyled>
      <AboutContent>
        <Thumbnail thumbnail={thumbnail} label={manifest.label} />

        {manifest.summary && <Summary summary={manifest.summary} as="p" />}

        {manifest.metadata && <Metadata metadata={manifest.metadata} />}

        {manifest.requiredStatement && (
          <RequiredStatement requiredStatement={manifest.requiredStatement} />
        )}

        <Rights rights={manifest.rights} />
        <Homepage
          homepage={homepage as unknown as NectarExternalWebResource[]}
        />
        <SeeAlso seeAlso={seeAlso as unknown as NectarExternalWebResource[]} />

        {manifest.id && (
          <>
            <label
              className="manifest-property-title"
              htmlFor="iiif-manifest-id"
            >
              IIIF Manifest
            </label>
            <span>
              <a href={manifest.id} target="_blank" id="iiif-manifest-id">
                {manifest.id}
              </a>
            </span>
          </>
        )}
      </AboutContent>
    </AboutStyled>
  );
};

export default About;
