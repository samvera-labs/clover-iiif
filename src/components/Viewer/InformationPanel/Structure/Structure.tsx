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

// Test utility.
// Render range in ascii with children + indentation.
const treeChars = {
    vertical: '│',
    horizontal: '─',
    corner: '└',
    tee: '├',
    space: ' ',
  };
  
  let rangeLabel = ''
  let rangeId = ''

  function renderRange(range: RangeTableOfContentsNode | null, skipCanvases = false, indent = 0) {
    if (!range) {
      return '';
    }
    const spaces = treeChars.space.repeat(indent);
    rangeLabel = `${getValue(range.label)}\n`;
    rangeId = `${getValue(range.id)}\n`;
    let str = `${getValue(range.label)}\n`;
    const itemsCount = range.items ? range.items.length : 0;
    range.items?.forEach((item, index) => {
      const isLastItem = index === itemsCount - 1;
      if (item.isCanvasLeaf && skipCanvases) return;
      if (typeof item === 'string') {
        str += `${spaces}${isLastItem ? treeChars.corner : treeChars.tee}${treeChars.horizontal}${treeChars.horizontal} ${item}\n`;
      } else {
        str += `${spaces}${isLastItem ? treeChars.corner : treeChars.tee}${treeChars.horizontal}${treeChars.horizontal} ${renderRange(item, skipCanvases, indent + 2)}`;
      }
    });
    return str;
  }

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
    const ascii = renderRange(tree);
    const items = renderRangeList(tree);

    return (
      <StructureStyled>
        <StructureContent>
          <Range id={rangeId} htmlLabel={rangeLabel} ascii={ascii} items={items} />
        </StructureContent>
      </StructureStyled>
    );
  };
  
  export default Structure;