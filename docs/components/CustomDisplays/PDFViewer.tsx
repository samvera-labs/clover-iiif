/**
 * Example of a custom component which accepts a Canvas id from
 * a Manifest.  It then renders expected PDF content by wrapping
 * in a simple iFrame (uses browser's default PDF renderer).
 *
 * One could make this as complex as they like, for flexible implementations.
 */

import {
  type Annotation,
  type AnnotationPage,
  type CanvasNormalized,
  type ManifestNormalized,
} from "@iiif/presentation-3";

import { Vault } from "@iiif/vault";
import { useState } from "react";

// The source manifest which is the same as iiifContent prop passed
// into Clover Viewer
const url = "http://localhost:3000/manifest/custom-displays/pdf.json";

const PDFViewer = ({ id }: { id: string }) => {
  const [pdfSrc, setPdfSrc] = useState();
  const vault = new Vault();

  vault.loadManifest(url).then(async (data: ManifestNormalized) => {
    if (!data) throw new Error("Manifest failed to load");

    const canvas: CanvasNormalized = vault.get(id);
    const annotationPage: AnnotationPage = vault.get(canvas.items[0].id);
    const annotation =
      annotationPage.items &&
      (vault.get(annotationPage.items[0]) as Annotation);

    setPdfSrc(annotation?.body && annotation.body[0].id);
  });

  if (!pdfSrc) return null;

  return (
    <div style={{ background: "hotpink", padding: "2rem" }}>
      <iframe src={pdfSrc} width="100%" height="600" />
    </div>
  );
};

export default PDFViewer;
