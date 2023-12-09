import React from "react";

import Viewer from "docs/components/DynamicImports/Viewer";

function Newspaper() {
  const manifests = [
    "http://localhost:3000/manifest/newspaper/newspaper_collection.json",
    "https://iiif.io/api/cookbook/recipe/0266-full-canvas-annotation/manifest.json",
    "https://iiif.io/api/cookbook/recipe/0019-html-in-annotations/manifest.json",
    "https://iiif.io/api/cookbook/recipe/0021-tagging/manifest.json",
    "https://iiif.io/api/cookbook/recipe/0261-non-rectangular-commenting/manifest.json",
    "https://iiif.io/api/cookbook/recipe/0258-tagging-external-resource/manifest.json",
    "https://iiif.io/api/cookbook/recipe/0326-annotating-image-layer/manifest.json",
    "https://iiif.io/api/cookbook/recipe/0135-annotating-point-in-canvas/manifest.json",
    "https://iiif.io/api/cookbook/recipe/0139-geolocate-canvas-fragment/manifest.json",
    "https://iiif.io/api/cookbook/recipe/0269-embedded-or-referenced-annotations/manifest.json",
    "https://iiif.io/api/cookbook/recipe/0306-linking-annotations-to-manifests/manifest.json",
    "https://iiif.io/api/cookbook/recipe/0377-image-in-annotation/manifest.json",
  ];
  const iiifContent = manifests[0];

  return (
    <Viewer
      iiifContent={iiifContent}
      options={{ informationPanel: { renderAbout: true } }}
    />
  );
}

export default Newspaper;
