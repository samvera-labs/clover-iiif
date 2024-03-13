import {
  Canvas,
  IIIFExternalWebResource,
  ImageService,
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

export const decodeContentStateContainerURI = (cs: string) => {
  if (!cs) return null;
  try {
    if (cs && cs.startsWith("http")) return cs;
    const json = JSON.parse(decodeContentState(cs));
    const container = json["partOf"];
    if (!container || container.length == 0) return null;
    const partOf = container[0];
    return partOf && partOf["id"] && "Manifest" == partOf["type"]
      ? partOf["id"]
      : json["id"];
  } catch {
    return null;
  }
};

export const decodeContentStateCanvasURI = (cs: string) => {
  return decodeContentStateURI(cs, "Canvas");
};

export const decodeContentStateManifestURI = (cs: string) => {
  return decodeContentStateURI(cs, "Manifest");
};

const decodeContentStateURI = (cs: string, iiifResourceType: string) => {
  if (!cs) return null;
  try {
    const json = JSON.parse(decodeContentState(cs));
    return json["type"] == iiifResourceType ? json["id"] : null;
  } catch {
    return null;
  }
};
