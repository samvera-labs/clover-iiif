import { AnnotationTarget, AnnotationNormalized } from "@iiif/presentation-3";
import { ParsedAnnotationTarget } from "src/types/annotations";
import { getLabel } from "src/hooks/use-iiif";
import { AnnotationResources } from "src/types/annotations";
import { type ViewerConfigOptions } from "src/context/viewer-context";

export type AnnotationTargetExtended = AnnotationTarget & {
  selector?: any;
  source?: string;
  svg?: string;
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

const parseAnnotationsFromAnnotationResources = (
  annotationResources: AnnotationResources,
  vault: any,
  configOptions: ViewerConfigOptions,
) => {
  const annotations: Array<AnnotationNormalized> = [];
  annotationResources
    .filter((annotationResource) => {
      if (annotationResource.label) {
        const label = getLabel(annotationResource.label);
        if (Array.isArray(label)) {
          return !label.some(
            (value) =>
              configOptions.ignoreAnnotationOverlaysLabels?.includes(value),
          );
        }
      }

      return true;
    })
    .forEach((annotationResource) => {
      annotationResource?.items?.forEach((item) => {
        const annotation = vault.get(item.id);
        annotations.push(annotation as unknown as AnnotationNormalized);
      });
    });

  return annotations;
};

export { parseAnnotationTarget, parseAnnotationsFromAnnotationResources };
