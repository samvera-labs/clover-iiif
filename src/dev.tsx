import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/pagination";

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
import Slider from "src/components/Slider";
import Viewer from "src/components/Viewer";

const App = () => {
  const [manifest, setManifest] = useState<Manifest>();

  const manifestId =
    "https://api.dc.library.northwestern.edu/api/v2/works/71153379-4283-43be-8b0f-4e7e3bfda275?as=iiif";
  const collectionId =
    "https://api.dc.library.northwestern.edu/api/v2/collections/c373ecd2-2c45-45f2-9f9e-52dc244870bd?as=iiif";

  useEffect(() => {
    (async () => {
      const data = await fetch(manifestId).then((response) => response.json());
      setManifest(data);
    })();
  }, [manifest]);

  if (!manifest) return null;

  return (
    <div style={{ padding: "1rem" }}>
      <Viewer iiifContent={manifestId} />
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
