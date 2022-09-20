import { useViewerState } from "@/context/viewer-context";
import { ContentResource, ManifestNormalized } from "@iiif/presentation-3";
import {
  Homepage,
  Metadata,
  RequiredStatement,
  Summary,
} from "@samvera/nectar-iiif";
import { NectarExternalWebResource } from "@samvera/nectar-iiif/dist/types/nectar";
import React, { useEffect, useState } from "react";
import { InformationStyled } from "./Information.styled";

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
      {manifest.summary && <Summary summary={manifest.summary} />}
      {manifest.metadata && <Metadata metadata={manifest.metadata} />}
      {manifest.requiredStatement && (
        <RequiredStatement requiredStatement={manifest.requiredStatement} />
      )}
      {manifest.homepage && (
        <Homepage
          homepage={manifest.homepage as unknown as NectarExternalWebResource[]}
        >
          View Homepage
        </Homepage>
      )}
      {manifest.rights && <span>{manifest.rights}</span>}
    </InformationStyled>
  );
};

export default Information;
