import { AnnotationResources } from "src/types/annotations";
import { CanvasNormalized } from "@iiif/presentation-3";

export type FormattedAnnotationItem = {
  [k: string]: any;
};

export const getAnnotationResources = (
  vault: any,
  activeCanvas: string,
): AnnotationResources => {
  const canvas: CanvasNormalized = vault.get({
    id: activeCanvas,
    type: "Canvas",
  });

  if (!canvas?.annotations || !canvas.annotations[0]) return [];

  const annotationPages: AnnotationResources = vault.get(canvas.annotations);

  /**
   * Filter out annotation pages that don't have any Annotations in the items array.
   */
  return annotationPages
    .filter((annotationPage) => {
      if (!annotationPage.items || !annotationPage.items.length) return false;
      return annotationPage;
    })
    .map((annotationPage) => {
      /**
       * If the annotation page doesn't have a label, add a default label.
       * Set this value in a CONFIG and not here.
       */
      const label = annotationPage.label || { none: ["Annotations"] };
      return { ...annotationPage, label };
    });

  // const annotations: Annotation[] = vault.get(annotationPage.items);
  // if (!Array.isArray(annotations)) return [];

  // const filteredAnnotations = annotations.filter((annotation) => {
  //   if (!annotation.body) return;

  //   const annotationBody = annotation.body as
  //     | ContentResource
  //     | ContentResource[];

  //   if (Array.isArray(annotationBody)) {
  //     if (annotationBody.length === 1) {
  //       const resource: IIIFExternalWebResource = vault.get(
  //         annotationBody[0].id,
  //       );

  //       annotation.body = resource;
  //     } else {
  //       const bodies: IIIFExternalWebResource[] = [];
  //       annotationBody.forEach((body) => {
  //         const resource: IIIFExternalWebResource = vault.get(body.id);
  //         bodies.push(resource);
  //       });

  //       annotation.body = bodies;
  //     }
  //   } else {
  //     const resource: IIIFExternalWebResource = vault.get(annotationBody.id);

  //     annotation.body = resource;
  //   }

  //   return annotation;
  // });

  // type GroupedResource = {
  //   body: AnnotationBody | AnnotationBody[] | undefined;
  //   target: AnnotationTarget | AnnotationTarget[] | undefined;
  //   motivation: string | string[] | undefined;
  //   localizedLabel: InternationalString;
  // };
  // const groupedResources = {} as { [k: string]: GroupedResource[] };
  // filteredAnnotations.forEach((annotation) => {
  //   console.log("annotation", annotation);
  //   const localizedLabel = annotation.label ||
  //     annotation.label || { none: ["Annotations"] };

  //   const labelValue = Object.values(localizedLabel)[0] as string[];
  //   const label = labelValue[0];

  //   if (!groupedResources[label]) {
  //     groupedResources[label] = [];
  //   }
  //   groupedResources[label].push({
  //     body: annotation.body,
  //     target: annotation.target,
  //     motivation: annotation.motivation && annotation.motivation[0],
  //     localizedLabel: localizedLabel,
  //   });
  // });

  // const results: LabeledAnnotationResource[] = [];
  // for (const [key, values] of Object.entries(groupedResources)) {
  //   const data = {
  //     id: key,
  //     label: values[0].localizedLabel,
  //     motivation: values[0].motivation,
  //     items: [] as any,
  //   };
  //   values.forEach((value) => {
  //     data.items.push({
  //       target: value.target,
  //       body: value.body,
  //     });
  //   });
  //   results.push(data);
  // }
};

// export const getAnnotationsFromPage = ({ vault: any }) => {};
