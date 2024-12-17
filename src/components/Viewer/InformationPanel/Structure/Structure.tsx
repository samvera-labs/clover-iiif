import {
    StructureContent,
    StructureStyled,
  } from "src/components/Viewer/InformationPanel/Structure/Structure.styled";
import {
ContentResource,
IIIFExternalWebResource,
ManifestNormalized,
} from "@iiif/presentation-3";
import {
    Id,
  } from "src/components/Viewer/Properties";
import React, { useEffect, useState } from "react";
import { ViewerContextStore, useViewerState } from "src/context/viewer-context";

import { PrimitivesExternalWebResource } from "src/types/primitives";

const Structure: React.FC = () => {
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
    }, [activeManifest, vault]);

    if (!manifest) return <></>;
  
    return (
      <StructureStyled>
        <StructureContent>
          <Id id={manifest.id} htmlLabel="IIIF Manifest" />
        </StructureContent>
      </StructureStyled>
    );
  };
  
  export default Structure;