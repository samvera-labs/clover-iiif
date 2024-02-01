import { AnnotationTarget } from "@iiif/presentation-3";
import { ParsedAnnotationTarget } from "src/types/annotations";

type AnnotationTargetExtended =
  | string
  | (AnnotationTarget & {
      selector?: any;
      source?: string;
    });

const parseAnnotationTarget = (target: AnnotationTargetExtended) => {
  // https://iiif.io/api/cookbook/recipe/0021-tagging/canvas/p1
  // https://iiif.io/api/cookbook/recipe/0021-tagging/canvas/p1#xywh=265,661,1260,1239
  // https://iiif.io/api/cookbook/recipe/0021-tagging/canvas/p1#t=31.5,55.5

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
    }
  }

  return parsedTarget;
};

export { parseAnnotationTarget };
