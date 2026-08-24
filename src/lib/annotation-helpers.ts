import {
  AnnotationNormalized,
  AnnotationTarget,
  EmbeddedResource,
} from "@iiif/presentation-3";
import { Vault } from "@iiif/helpers/vault";

import { ParsedAnnotationTarget } from "src/types/annotations";

export type AnnotationTargetExtended = AnnotationTarget & {
  selector?: any;
  source?: string;
  svg?: string;
};

const getLanguageDirection = (bcp47Code) => {
  if (!bcp47Code) return "LTR"; // Default to LTR if no code is provided

  // Exhaustive list of RTL languages
  const rtlLanguages = [
    "ar",
    "fa",
    "ur",
    "ps",
    "dv",
    "sd",
    "ug",
    "ku",
    "he",
    "yi",
    "jrb",
    "jpr",
    "nqo",
  ];

  // Get the base language from the BCP47 code
  // bcp is an array?

  const baseLang = Array.isArray(bcp47Code)
    ? bcp47Code[0]?.split("-")[0]
    : bcp47Code?.split("-")[0]; // Extract the base language
  return rtlLanguages.includes(baseLang) ? "RTL" : "LTR";
};

const parseAnnotationTarget = (target: AnnotationTargetExtended | string) => {
  let parsedTarget: ParsedAnnotationTarget = {
    id: typeof target === "string" ? target : target.source,
  };

  if (typeof target === "string") {
    if (target.includes("#xywh=")) {
      const parts = target.split("#xywh=");
      if (parts && parts[1]) {
        const [x, y, w, h] = parts[1].split(",").map((value) => Number(value));
        parsedTarget = {
          id: parts[0],
          rect: {
            x,
            y,
            w,
            h,
          },
        };
      }
    } else if (target.includes("#t=") || target.includes("&t=")) {
      const separator = target.includes("#t=") ? "#t=" : "&t=";
      const parts = target.split(separator);
      if (parts && parts[1]) {
        parsedTarget = {
          id: parts[0],
          t: parts[1],
        };
      }
    }
  } else if (typeof target === "object") {
    if (target.selector?.type === "PointSelector") {
      parsedTarget = {
        id: target.source,
        point: {
          x: target.selector.x!,
          y: target.selector.y!,
        },
      };
    } else if (target.selector?.type === "SvgSelector") {
      parsedTarget = {
        id: target.source,
        svg: target.selector.value,
      };
    } else if (target.selector?.type === "FragmentSelector") {
      const sourceId =
        typeof target.source === "string"
          ? target.source
          : target.source?.id;

      if (target.selector?.value.includes("xywh=") && sourceId) {
        const parts = target.selector?.value.split("xywh=");
        if (parts && parts[1]) {
          const [x, y, w, h] = parts[1]
            .split(",")
            .map((value) => Number(value));

          parsedTarget = {
            id: sourceId,
            rect: { x, y, w, h },
          };
        }
      } else if (target.selector?.value.includes("t=") && sourceId) {
        const parts = target.selector.value.split("t=");
        if (parts && parts[1]) {
          parsedTarget = {
            id: sourceId,
            t: parts[1],
          };
        }
      }
    } else {
      // Vault normalizes "&t=" query-param style targets to SpecificResource
      // without a selector (it only splits on "#"). Extract time from source.id.
      const sourceId =
        typeof target.source === "string"
          ? target.source
          : target.source?.id;
      if (sourceId?.includes("&t=")) {
        const parts = sourceId.split("&t=");
        if (parts[1]) {
          parsedTarget = { id: parts[0], t: parts[1] };
        }
      }
    }
  }

  return parsedTarget;
};

type AnnotationBodySource = {
  body?: unknown;
};

const resolveAnnotationBodies = (
  annotation?: AnnotationBodySource,
  vault?: Vault,
): EmbeddedResource[] => {
  if (!annotation?.body) return [];

  const bodies = Array.isArray(annotation.body)
    ? annotation.body
    : [annotation.body];

  return bodies
    .map((body) => {
      if (!body) return undefined;

      if (typeof body === "string") {
        return vault?.get(body) as EmbeddedResource;
      }

      if (typeof body === "object") {
        if ("value" in body || "language" in body || body?.["type"] === "TextualBody") {
          return body as EmbeddedResource;
        }

        const referenceId = (body as { id?: string }).id;
        if (referenceId && vault) {
          return vault.get(referenceId) as EmbeddedResource;
        }
      }

      return undefined;
    })
    .filter((body): body is EmbeddedResource => Boolean(body));
};

function normalizeMotivations(
  motivation?: string | string[] | null,
): string[] {
  if (!motivation) return [];
  return Array.isArray(motivation) ? motivation : [motivation];
}

function annotationMatchesMotivations(
  annotation?: { motivation?: string | string[] | null },
  allowedMotivations?: string[],
): boolean {
  if (!annotation) return false;
  if (!allowedMotivations) return true;
  if (allowedMotivations.length === 0) return false;

  const annotationMotivations = normalizeMotivations(annotation.motivation);
  if (annotationMotivations.length === 0) return false;

  return annotationMotivations.some((motivation) =>
    allowedMotivations.includes(motivation),
  );
}

function filterAnnotationsByMotivation<T extends { motivation?: string | string[] | null }>(
  annotations: Array<T | undefined>,
  allowedMotivations?: string[],
): T[] {
  if (!annotations || annotations.length === 0) return [];
  if (!allowedMotivations) return annotations.filter(Boolean) as T[];
  if (allowedMotivations.length === 0) return [];

  return annotations.filter((annotation) =>
    annotationMatchesMotivations(annotation, allowedMotivations),
  ) as T[];
}

function extractLanguages(
  annotations: Array<AnnotationNormalized | AnnotationBodySource>,
  vault?: Vault,
) {
  if (!annotations || annotations.length === 0) return [];

  const languages = new Set<string>();

  const addLanguage = (language: unknown) => {
    if (!language) return;
    if (Array.isArray(language)) {
      language.forEach(addLanguage);
      return;
    }
    if (typeof language === "string") {
      languages.add(language);
    }
  };

  function findLanguage(obj: unknown) {
    if (Array.isArray(obj)) {
      obj.forEach(findLanguage);
    } else if (obj && typeof obj === "object") {
      const record = obj as Record<string, unknown>;
      if ("language" in record) {
        addLanguage(record.language);
      }
      Object.values(record).forEach(findLanguage);
    }
  }

  const normalizedAnnotations = vault
    ? annotations.map((annotation) => {
        const resolvedBodies = resolveAnnotationBodies(annotation, vault);
        if (!resolvedBodies.length) return annotation;
        return { ...annotation, body: resolvedBodies };
      })
    : annotations;

  findLanguage(normalizedAnnotations);
  return Array.from(languages);
}

export {
  getLanguageDirection,
  extractLanguages,
  parseAnnotationTarget,
  filterAnnotationsByMotivation,
  annotationMatchesMotivations,
  resolveAnnotationBodies,
};

/**
 * Is this annotation body an external caption/subtitle resource?
 *
 * A `<track>` element needs a URL it can fetch. An AnnotationPage on an A/V
 * canvas may legitimately carry descriptive annotations whose bodies are
 * embedded (`TextualBody` and friends): they hold their text inline and have no
 * dereferenceable id. Rendering those as `<track src="...">` makes the browser
 * request a subtitle file that does not exist.
 *
 * Embedded bodies also have no `id` of their own, so the Vault mints a
 * content-derived `vault://<hash>`. Two bodies with the same text share a hash,
 * which yields duplicate React keys — one warning per collision, per render.
 */
export function isCaptionResource(body?: {
  id?: string;
  type?: string;
  format?: string;
}): boolean {
  if (!body?.id) return false;

  // The Vault mints `vault://<hash>` for embedded resources with no id.
  if (String(body.id).startsWith("vault://")) return false;

  // Embedded text bodies are not fetchable.
  if (body.type === "TextualBody") return false;

  const format = String(body.format ?? "").toLowerCase();
  if (format) return format === "text/vtt" || format === "application/x-subrip";

  // No format declared: fall back to the file extension.
  return /\.(vtt|srt)(\?|#|$)/i.test(String(body.id));
}
