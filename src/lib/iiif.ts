import {
  Canvas,
  CollectionNormalized,
  IIIFExternalWebResource,
  ImageService,
  ManifestNormalized,
  Service,
} from "@iiif/presentation-3";
import { decodeContentState } from "@iiif/vault-helpers";

export const getCanvasResource = (canvas: Canvas) => {
  if (canvas?.items) {
    const annotationPage = canvas?.items[0];
    if (annotationPage?.items) {
      const resource = annotationPage?.items[0].body as IIIFExternalWebResource;
      if (resource?.hasOwnProperty("id")) {
        return resource.id as string;
      }
    }
  }
};

export const getInfoResponse = (id: string) =>
  fetch(`${id.replace(/\/$/, "")}/info.json`)
    .then((response) => response.json())
    .then((json) => json)
    .catch((error: any) => {
      console.error(
        `The IIIF tilesource ${id.replace(
          /\/$/,
          "",
        )}/info.json failed to load: ${error}`,
      );
    });

export const getImageServiceURI = (service: Service[] | undefined) => {
  let imageService: ImageService;
  let imageServiceURI: string | undefined;

  if (Array.isArray(service)) {
    imageService = service[0] as ImageService;
    if (imageService) {
      let id: string | undefined;
      "@id" in imageService
        ? (id = imageService["@id"])
        : (id = imageService.id);

      imageServiceURI = id;
    }
  }

  return imageServiceURI;
};

const parseIiifContent = (iiifContent: string) => {
  let resourceId;
  let active;
  if (isURL(iiifContent)) {
    resourceId = iiifContent;
    active = {};
  } else {
    const json = JSON.parse(decodeContentState(iiifContent));
    switch (json?.type) {
      // https://iiif.io/api/content-state/1.0/#51-a-region-of-a-canvas-in-a-manifest
      // https://iiif.io/api/content-state/1.0/#52-start-playing-at-a-point-in-a-recording
      // https://iiif.io/api/content-state/1.0/#53-multiple-targets-for-a-comparison-view
      // https://iiif.io/api/content-state/1.0/#54-search-results
      case "SpecificResource":
      case "Range":
      case "Annotation":
        resourceId = json?.target.partOf[0].id;
        active = {
          manifest: resourceId,
          canvas: json?.target.id,
        };
        break;
      case "Canvas":
        resourceId = json?.partOf[0].id;
        active = {
          manifest: resourceId,
          canvas: json?.id,
        };
        break;
      case "Manifest":
        resourceId = json?.id;
        active = {
          collection: json?.partOf[0]?.id,
          manifest: json?.id,
        };
        break;
      case "Collection":
        resourceId = json?.id;
        active = {
          collection: resourceId,
        };
        break;
    }
  }
  return { resourceId, active };
};

export const decodeContentStateContainerURI = (iiifContent: string) => {
  const { resourceId, active } = parseIiifContent(iiifContent);
  return active.collection || active.manifest || resourceId;
};

export const getActiveCanvas = (
  iiifContent: string,
  manifest: ManifestNormalized,
) => {
  const canvases = manifest.items.map((item) => item.id);
  const { active } = parseIiifContent(iiifContent);
  const canvas = active.canvas;
  return canvases.includes(canvas) ? canvas : canvases[0];
};

export const getActiveManifest = (
  iiifContent: string,
  collection: CollectionNormalized,
) => {
  const { active } = parseIiifContent(iiifContent);
  const manifest = active.manifest;
  const manifests = collection.items
    .filter((item) => item.type === "Manifest")
    .map((manifest) => manifest.id);
  if (manifests.length == 0) return null;
  return manifests.includes(manifest) ? manifest : manifests[0];
};

const isURL = (url: string) => {
  try {
    new URL(url);
  } catch {
    return false;
  }
  return true;
};
