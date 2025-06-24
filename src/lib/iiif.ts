import {
  Canvas,
  CollectionNormalized,
  IIIFExternalWebResource,
  ImageService,
  ManifestNormalized,
  Service,
} from "@iiif/presentation-3";

import { convertPresentation2 } from "@iiif/parser/presentation-2";
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

export const getContextAsArray = (json) => {
  const context = Array.isArray(json["@context"])
    ? json["@context"]
    : [json["@context"]];

  return context.map((uri) => uri?.replace("http://", "https://"));
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

export const upgradeIiifContent = (json: any): any => {
  const validContexts = [
    "https://iiif.io/api/presentation/2/context.json",
    "https://iiif.io/api/presentation/3/context.json",
  ];
  const contextError = new TypeError(
    `The IIIF content may not be a valid IIIF resource: ${validContexts.join(", ")}`,
  );

  if (!json["@context"]) console.warn(contextError);

  const context = getContextAsArray(json);

  try {
    if (context.includes(validContexts[0])) {
      const upgradedIiifContent = convertPresentation2(json);
      /**
       * Check if the upgraded content has the required properties.
       * If not, throw an error to indicate that the content is not valid.
       */
      if (
        !upgradedIiifContent ||
        !upgradedIiifContent.id ||
        !upgradedIiifContent.type
      ) {
        throw contextError;
      }

      return upgradedIiifContent;
    } else if (context.includes(validContexts[1])) {
      return json;
    } else {
      throw contextError;
    }
  } catch (e) {
    console.warn(e);
  }
};

export const parseIiifContent = (iiifContent) => {
  if (typeof iiifContent === "string" && isURL(iiifContent)) {
    return { resourceId: iiifContent };
    // check if iiifContent is a JSON object
  } else if (typeof iiifContent === "object") {
    const upgradedIiifContent = upgradeIiifContent(iiifContent);

    return {
      resourceId: upgradedIiifContent?.id,
      resourceObject: upgradedIiifContent,
    };
  } else {
    const json = JSON.parse(decodeContentState(iiifContent));
    const { active } = parseContentStateJson(json);

    return { active, resourceId: json?.resourceId, resourceObject: json };
  }
};

export const decodeContentStateContainerURI = (
  iiifContent: string | object,
) => {
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
