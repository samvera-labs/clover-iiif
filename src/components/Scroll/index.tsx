import React, { useContext, useEffect, useState } from "react";
import { ScrollContext, ScrollProvider } from "src/context/scroll-context";

import { ManifestNormalized } from "@iiif/presentation-3";
import ScrollHeader from "src/components/Scroll/Layout/Header";
import ScrollItems from "src/components/Scroll/Items/Items";
import { StyledScrollWrapper } from "src/components/Scroll/Layout/Layout.styled";
import { extractLanguages } from "src/lib/annotation-helpers";
import useManifestAnnotations from "src/hooks/useManifestAnnotations";

export interface CloverScrollProps {
  iiifContent: string;
  options;
}

const RenderCloverScroll = ({ iiifContent }: { iiifContent: string }) => {
  const [manifest, setManifest] = useState<ManifestNormalized>();
  const [hasDefinedLanguages, setHasDefinedLanguages] = useState(false);

  const { state, dispatch } = useContext(ScrollContext);
  const { options, vault } = state;

  const annotations = useManifestAnnotations(manifest?.items, vault);

  useEffect(() => {
    if (!vault) return;

    vault
      .load(iiifContent)
      .then((data: ManifestNormalized) => data && setManifest(data))
      .catch((error: Error) =>
        console.error(`Manifest ${iiifContent} failed to load: ${error}`),
      );
  }, [iiifContent]);

  useEffect(() => {
    const extractedLanguages = extractLanguages(annotations);
    const activeLanguages = !extractedLanguages.length
      ? []
      : options?.language?.defaultLanguages || extractedLanguages;

    setHasDefinedLanguages(Boolean(extractedLanguages.length));

    dispatch({
      type: "updateAnnotations",
      payload: annotations,
    });
    dispatch({
      type: "updateActiveLanguages",
      payload: activeLanguages,
    });
  }, [annotations]);

  if (!manifest) return null;

  return (
    <StyledScrollWrapper>
      {manifest && (
        <>
          <ScrollHeader
            label={manifest?.label}
            hasDefinedLanguages={hasDefinedLanguages}
          />
          <ScrollItems items={manifest.items} />
        </>
      )}
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
