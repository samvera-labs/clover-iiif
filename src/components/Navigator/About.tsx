import { useViewerState } from "@/context/viewer-context";
import {
  IIIFExternalWebResource,
  InternationalString,
  ManifestNormalized,
} from "@iiif/presentation-3";
import {
  Label,
  Homepage,
  Metadata,
  RequiredStatement,
  SeeAlso,
  Summary,
  Thumbnail,
} from "@samvera/nectar-iiif";
import { NectarExternalWebResource } from "@samvera/nectar-iiif/dist/types/nectar";
import React, { useEffect, useState } from "react";
import { AboutContent, AboutStyled } from "./About.styled";

interface Props {}

const About: React.FC<Props> = () => {
  const viewerState: any = useViewerState();
  const { activeManifest, vault } = viewerState;

  const [manifest, setManifest] = useState<ManifestNormalized>();

  const [thumbnail, setThumbnail] = useState<IIIFExternalWebResource[] | []>(
    [],
  );
  const [seeAlso, setSeeAlso] = useState<IIIFExternalWebResource[] | []>(
    [],
  );

  useEffect(() => {
    const data = vault.get(activeManifest);
    setManifest(data);

    if (data.thumbnail?.length > 0) setThumbnail(vault.get(data.thumbnail));
    if (data.seeAlso?.length > 0) setSeeAlso(vault.get(data.seeAlso));
  }, [activeManifest, vault]);

  if (!manifest) return <></>;

  return (
    <AboutStyled>
      <AboutContent>
        {thumbnail?.length > 0 && (
          <Thumbnail
            altAsLabel={manifest.label as InternationalString}
            thumbnail={thumbnail as unknown as IIIFExternalWebResource[]}
          />
        )}

        {manifest.summary && <Summary summary={manifest.summary} as="p" />}

        {manifest.metadata && <Metadata metadata={manifest.metadata} />}

        {manifest.requiredStatement && (
          <RequiredStatement requiredStatement={manifest.requiredStatement} />
        )}

        {manifest.rights && (
          <>
            <label
              className="manifest-property-title"
              htmlFor="iiif-manifest-rights"
            >
              Rights
            </label>
            <span>
              <a
                href={manifest.rights}
                target="_blank"
                id="iiif-manifest-rights"
              >
                {manifest.rights}
              </a>
            </span>
          </>
        )}

        {manifest.homepage?.length > 0 && (
          <>
            <label
              className="manifest-property-title"
              htmlFor="iiif-manifest-homepage"
            >
              Homepage
            </label>
            <Homepage
              homepage={
                manifest.homepage as unknown as NectarExternalWebResource[]
              }
              id="iiif-manifest-homepage"
            >
              View <Label label={manifest.label as InternationalString} />
            </Homepage>
          </>
        )}

        {seeAlso?.length > 0 && (
          <>
            <label
              className="manifest-property-title"
              htmlFor="iiif-manifest-see-also"
            >
              See Also
            </label>
            <SeeAlso
              seeAlso={
                seeAlso as unknown as NectarExternalWebResource[]
              }
              id="iiif-manifest-see-also"
              as="ul"
            />
          </>
        )}

        {manifest.seeAlso?.length > 0 && (
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
