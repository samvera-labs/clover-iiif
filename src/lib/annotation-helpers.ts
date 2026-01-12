import { AnnotationNormalized, AnnotationTarget } from "@iiif/presentation-3";

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
    } else if (target.includes("#t=")) {
      const parts = target.split("#t=");
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
      if (
        target.selector?.value.includes("xywh=") &&
        target.source.type == "Canvas" &&
        target.source.id
      ) {
        const parts = target.selector?.value.split("xywh=");
        if (parts && parts[1]) {
          const [x, y, w, h] = parts[1]
            .split(",")
            .map((value) => Number(value));

          parsedTarget = {
            id: target.source.id,
            rect: {
              x,
              y,
              w,
              h,
            },
          };
        }
      }
    }
  }

  return parsedTarget;
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

function extractLanguages(annotations: AnnotationNormalized[]) {
  const languages = new Set();

  function findLanguage(obj) {
    if (Array.isArray(obj)) {
      obj.forEach(findLanguage);
    } else if (obj && typeof obj === "object") {
      if (obj.language) {
        languages.add(obj.language);
      }
      Object.values(obj).forEach(findLanguage);
    }
  }

  findLanguage(annotations);
  return Array.from(languages);
}

export {
  getLanguageDirection,
  extractLanguages,
  parseAnnotationTarget,
  filterAnnotationsByMotivation,
  annotationMatchesMotivations,
};
