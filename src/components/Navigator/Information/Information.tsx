import { useViewerState } from "@/context/viewer-context";
import {
  ContentResource,
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
} from "@samvera/nectar-iiif";
import { NectarExternalWebResource } from "@samvera/nectar-iiif/dist/types/nectar";
import React, { useEffect, useState } from "react";
import { InformationContent, InformationStyled } from "./Information.styled";

interface Props {}

const Information: React.FC<Props> = () => {
  const viewerState: any = useViewerState();
  const { activeManifest, vault } = viewerState;

  const [manifest, setManifest] = useState<ManifestNormalized>();

  useEffect(() => {
    const data = vault.get(activeManifest);
    setManifest(data);
  }, [activeManifest, vault]);

  if (!manifest) return <></>;

  return (
    <InformationStyled>
      <InformationContent>
        {manifest.summary && <Summary summary={manifest.summary} as="p" />}
        {manifest.metadata && <Metadata metadata={manifest.metadata} />}
        {manifest.requiredStatement && (
          <RequiredStatement requiredStatement={manifest.requiredStatement} />
        )}
        {manifest.rights && (
          <dl>
            <dt>Rights</dt>
            <dd>{manifest.rights}</dd>
          </dl>
        )}
        {manifest.homepage?.length > 0 && (
          <>
            <span className="manifest-property-title">Homepage</span>
            <Homepage
              homepage={
                manifest.homepage as unknown as NectarExternalWebResource[]
              }
            >
              View <Label label={manifest.label as InternationalString} />
            </Homepage>
          </>
        )}
        {manifest.seeAlso?.length > 0 && (
          <>
            <span className="manifest-property-title">See Also</span>
            <SeeAlso
              seeAlso={
                manifest.seeAlso as unknown as NectarExternalWebResource[]
              }
              as="ul"
            />
          </>
        )}
      </InformationContent>
    </InformationStyled>
  );
};

export default Information;
