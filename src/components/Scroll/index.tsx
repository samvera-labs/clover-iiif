import React, { useContext, useEffect, useState } from "react";
import { ScrollContext, ScrollProvider } from "src/context/scroll-context";

import { ManifestNormalized } from "@iiif/presentation-3";
import ScrollHeader from "src/components/Scroll/Layout/Header";
import ScrollItems from "src/components/Scroll/Items/Items";
import { StyledScrollWrapper } from "src/components/Scroll/Layout/Layout.styled";
import useManifestAnnotations from "src/hooks/useManifestAnnotations";

export interface CloverScrollProps {
  iiifContent: string;
  options;
}

const RenderCloverScroll = ({ iiifContent }: { iiifContent: string }) => {
  const [manifest, setManifest] = useState<ManifestNormalized>();

  const { state, dispatch } = useContext(ScrollContext);
  const { vault } = state;

  const annotations = useManifestAnnotations(manifest?.items, vault);

  useEffect(() => {
    if (!vault) return;

    vault
      .load(iiifContent)
      .then((data: ManifestNormalized) => data && setManifest(data))
      .catch((error: Error) =>
        console.error(`Manifest ${iiifContent} failed to load: ${error}`),
      );
  }, [iiifContent, vault]);

  useEffect(() => {
    dispatch({
      type: "updateAnnotations",
      payload: annotations,
    });
  }, [annotations, dispatch]);

  if (!manifest) return null;

  return (
    <StyledScrollWrapper>
      {manifest.label && <ScrollHeader label={manifest.label} />}
      {manifest.items && <ScrollItems items={manifest.items} />}
    </StyledScrollWrapper>
  );
};

const CloverScroll: React.FC<CloverScrollProps> = ({
  iiifContent,
  options,
}) => {
  return (
    <ScrollProvider options={options}>
      <RenderCloverScroll iiifContent={iiifContent} />
    </ScrollProvider>
  );
};

export default CloverScroll;
