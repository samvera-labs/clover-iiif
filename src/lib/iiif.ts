import {
  Canvas,
  CollectionNormalized,
  IIIFExternalWebResource,
  ImageService,
  ManifestNormalized,
  Service,
} from "@iiif/presentation-3";

import { decodeContentState } from "@iiif/helpers";

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

export const parseContentStateJson = (json) => {
  let resourceId;
  let active: any = {};

  switch (json?.type) {
    case "SpecificResource":
      resourceId = json?.target?.partOf?.[0]?.id;
      active = {
        manifest: resourceId,
        canvas: json?.target?.id,
      };
      if (json?.selector) {
        active.selector = json.selector;
      }
      break;
    case "Range":
    case "Annotation":
      const targetSource = json?.target?.source || json?.target;
      const targetSelector = json?.target?.selector;
      active = {
        manifest: targetSource?.partOf?.[0]?.id,
        canvas: targetSource?.id,
      };
      if (json?.target?.type === "SpecificResource") {
        active.selector = targetSelector;
      } else if (json?.target?.selector) {
        active.selector = targetSelector;
      }
      break;
    case "Canvas":
      resourceId = json?.partOf?.[0]?.id;
      active = {
        manifest: resourceId,
        canvas: json?.id,
      };
      if (json?.id?.includes("#xywh=")) {
        const [canvasId, xywh] = json.id.split("#xywh=");
        active.canvas = canvasId;
        active.selector = {
          type: "FragmentSelector",
          value: `xywh=${xywh}`,
        };
      }
      break;
    case "Manifest":
      resourceId = json?.id;
      active = {
        collection: json?.partOf?.[0]?.id,
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
  return { resourceId, active };
};

export const parseIiifContent = (iiifContent: string) => {
  if (isURL(iiifContent)) {
    return { resourceId: iiifContent };
  } else {
    const json = JSON.parse(decodeContentState(iiifContent));
    const { active } = parseContentStateJson(json);

    return { active, resourceId: json?.resourceId, resourceObject: json };
  }
};

export const decodeContentStateContainerURI = (iiifContent: string) => {
  const { resourceId, resourceObject } = parseIiifContent(iiifContent);
  return resourceObject || resourceId;
};

export const getActiveCanvas = (manifest: ManifestNormalized) => {
  const canvases = manifest.items.map((item) => item.id);
  return canvases[0];
};

export const getActiveManifestFromCollection = (
  collection: CollectionNormalized,
) => {
  const manifests = collection.items
    .filter((item) => item.type === "Manifest")
    .map((manifest) => manifest.id);
  if (manifests.length == 0) return null;
  return manifests[0];
};

const isURL = (url: string) => {
  try {
    new URL(url);
  } catch {
    return false;
  }
  return true;
};
