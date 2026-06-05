import {
  Homepage,
  Label,
  Metadata,
  PartOf,
  Rendering,
  RequiredStatement,
  SeeAlso,
  Summary,
  Thumbnail,
} from "src/components/Primitives";
import {
  IIIFExternalWebResource,
  InternationalString,
  Manifest,
  MetadataItem,
} from "@iiif/presentation-3";
import {
  PrimitivesExternalWebResource,
  PrimitivesIIIFResource,
} from "./types/primitives";
import React, { useEffect, useState } from "react";

import ReactDOM from "react-dom/client";
import { initCloverI18n } from "src/i18n/config";
import Slider from "src/components/Slider";
import Viewer from "src/components/Viewer";

initCloverI18n();

const App = () => {
  const [manifest, setManifest] = useState<Manifest>();

  const manifestId =
    "https://api.dc.library.northwestern.edu/api/v2/works/40f87ae4-9666-4a8e-b6ce-a891096fefd3?as=iiif";
  const collectionId =
    "https://api.dc.library.northwestern.edu/api/v2/collections/c373ecd2-2c45-45f2-9f9e-52dc244870bd?as=iiif";

  const viewerOptions = {
    informationPanel: {
      renderAbout: false,
      renderAnnotation: true,
      renderToggle: true,
      renderContentSearch: true,
    },
  };

  useEffect(() => {
    (async () => {
      const data = await fetch(manifestId).then((response) => response.json());
      setManifest(data);
    })();
  }, [manifest]);

  if (!manifest) return null;

  return (
    <div style={{ padding: "1rem" }}>
      <Viewer iiifContent={manifestId} options={viewerOptions} />
      <Slider iiifContent={collectionId} />
      <article>
        <Label label={manifest.label} as="h1" />
        <Summary summary={manifest.summary as InternationalString} />
        <Metadata metadata={manifest.metadata as MetadataItem[]} />
        <RequiredStatement
          requiredStatement={manifest.requiredStatement as MetadataItem}
        />
        <Homepage
          homepage={manifest.homepage as PrimitivesExternalWebResource[]}
        />
        <PartOf partOf={manifest.partOf as PrimitivesIIIFResource[]} />
        <SeeAlso
          seeAlso={manifest.seeAlso as PrimitivesExternalWebResource[]}
        />
        <Rendering
          rendering={manifest.rendering as PrimitivesExternalWebResource[]}
        />
        <Thumbnail
          thumbnail={manifest.thumbnail as IIIFExternalWebResource[]}
          altAsLabel={manifest.label as InternationalString}
        />
      </article>
    </div>
  );
};

ReactDOM.createRoot(document.getElementById("root") as HTMLElement).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
);
