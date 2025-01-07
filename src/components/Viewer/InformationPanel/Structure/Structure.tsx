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
    Range,
  } from "src/components/Viewer/Properties";
import React, { useEffect, useState } from "react";
import { ViewerContextStore, useViewerState } from "src/context/viewer-context";
import {
    getValue,
    rangeToTableOfContentsTree,
    rangesToTableOfContentsTree,
    RangeTableOfContentsNode,
  } from "@iiif/helpers"

  function renderRangeList(range: RangeTableOfContentsNode | null, skipCanvases = false, indent = 0) {
    if (!range) {
      return '';
    }
    return range.items;
  }

const Structure: React.FC = () => {
    const viewerState: ViewerContextStore = useViewerState();
    const { activeManifest, vault } = viewerState;
  
    const [manifest, setManifest] = useState<ManifestNormalized>();
  
    useEffect(() => {
      const data: ManifestNormalized = vault.get(activeManifest);
      setManifest(data);
    }, [activeManifest, vault]);

    if (!manifest) return <></>;

    const tree = rangeToTableOfContentsTree(vault, manifest.structures[0] as any);
    const items = renderRangeList(tree);

    return (
      <StructureStyled>
        <StructureContent>
          <Range items={items} />
        </StructureContent>
      </StructureStyled>
    );
  };
  
  export default Structure;