import {
  AnnotationForEditor,
  AnnotationFromAnnotorious,
  AnnotationPageForEditor,
  AnnotationForAnnotorious,
  AnnotationBodyAnnotorious,
} from "../types/annotation";

export async function saveAnnotation(
  webAnnotation: AnnotationFromAnnotorious,
  manifestId: string,
  activeCanvas: string,
  unit: "pixel" | "percent",
  token?: string,
  annotationServer?: string,
): Promise<void> {
  if (token && annotationServer) {
    await fetch(annotationServer, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        canvas: activeCanvas,
        annotation: convertWebAnnotationToIIIFAnnotation(
          webAnnotation,
          manifestId,
          activeCanvas,
          unit,
        ),
      }),
    });
  } else if (!token) {
    let annotations = {} as { [k: string]: AnnotationPageForEditor };
    const savedAnnotations = window.localStorage.getItem("annotations");
    if (savedAnnotations) {
      const annotationsObj = JSON.parse(savedAnnotations);
      if (annotationsObj[activeCanvas] == undefined) {
        annotationsObj[activeCanvas] = {
          "@context": "http://iiif.io/api/presentation/3/context.json",
          id: activeCanvas,
          items: [],
          type: "AnnotationPage",
        };
      }
      annotationsObj[activeCanvas].items.push(
        convertWebAnnotationToIIIFAnnotation(
          webAnnotation,
          manifestId,
          activeCanvas,
          unit,
        ),
      );
      annotations = annotationsObj;
    } else {
      annotations[activeCanvas] = {
        "@context": "http://iiif.io/api/presentation/3/context.json",
        id: activeCanvas,
        items: [
          convertWebAnnotationToIIIFAnnotation(
            webAnnotation,
            manifestId,
            activeCanvas,
            unit,
          ),
        ],
        type: "AnnotationPage",
      };
    }

    window.localStorage.setItem("annotations", JSON.stringify(annotations));
  }
}

export async function fetchAnnotations(
  activeCanvas: string,
  unit: "pixel" | "percent",
  token?: string,
  annotationServer?: string,
): Promise<AnnotationForAnnotorious[]> {
  let annotations: AnnotationForAnnotorious[] = [];

  if (token && annotationServer) {
    const res = await fetch(annotationServer + "?action=GET", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        canvas: activeCanvas,
      }),
    });
    if (res.ok) {
      const savedAnnotations = await res.json();
      annotations = convertIIIFAnnotationPageToWebAnnotations(
        savedAnnotations,
        unit,
      );
    } else {
      const error = await res.json();
      console.error(error);
    }
  } else if (!token) {
    const savedAnnotationsAll = window.localStorage.getItem("annotations");
    if (savedAnnotationsAll) {
      const savedAnnotation = JSON.parse(savedAnnotationsAll)[activeCanvas];
      if (savedAnnotation) {
        annotations = convertIIIFAnnotationPageToWebAnnotations(
          savedAnnotation,
          unit,
        );
      }
    }
  }

  return annotations;
}

export async function deleteAnnotation(
  webAnnotation: AnnotationFromAnnotorious,
  manifestId: string,
  activeCanvas: string,
  unit: "pixel" | "percent",
  token?: string,
  annotationServer?: string,
): Promise<void> {
  if (token && annotationServer) {
    await fetch(annotationServer, {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        canvas: activeCanvas,
        annotation: convertWebAnnotationToIIIFAnnotation(
          webAnnotation,
          manifestId,
          activeCanvas,
          unit,
        ),
      }),
    });
  } else if (!token) {
    const savedAnnotations = window.localStorage.getItem("annotations");
    if (savedAnnotations) {
      const annotations = JSON.parse(savedAnnotations);
      const selectedAnnotations = annotations[activeCanvas];
      if (selectedAnnotations) {
        const otherAnnotations = selectedAnnotations.items.filter(
          (ann: any) => ann.id !== webAnnotation.id,
        );
        annotations[activeCanvas] = {
          id: activeCanvas,
          items: otherAnnotations,
          type: "AnnotationPage",
        };
        window.localStorage.setItem("annotations", JSON.stringify(annotations));
      }
    }
  }
}

export async function updateAnnotation(
  webAnnotation: AnnotationFromAnnotorious,
  manifestId: string,
  activeCanvas: string,
  unit: "pixel" | "percent",
  token?: string,
  annotationServer?: string,
): Promise<void> {
  if (token && annotationServer) {
    await fetch(annotationServer, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        canvas: activeCanvas,
        annotation: convertWebAnnotationToIIIFAnnotation(
          webAnnotation,
          manifestId,
          activeCanvas,
          unit,
        ),
      }),
    });
  } else if (!token) {
    const savedAnnotations = window.localStorage.getItem("annotations");
    if (savedAnnotations) {
      const annotations = JSON.parse(savedAnnotations);
      const selectedAnnotations = annotations[activeCanvas];
      if (selectedAnnotations) {
        const updatedAnnotations: any = [];
        selectedAnnotations.items.forEach((ann: any) => {
          if (ann.id === webAnnotation.id) {
            updatedAnnotations.push(
              convertWebAnnotationToIIIFAnnotation(
                webAnnotation,
                manifestId,
                activeCanvas,
                unit,
              ),
            );
          } else {
            updatedAnnotations.push(ann);
          }
        });
        annotations[activeCanvas] = {
          id: activeCanvas,
          items: updatedAnnotations,
          type: "AnnotationPage",
        };
        window.localStorage.setItem("annotations", JSON.stringify(annotations));
      }
    }
  }
}

export function convertWebAnnotationToIIIFAnnotation(
  webAnnotation: AnnotationFromAnnotorious,
  manifestId: string,
  canvasId: string,
  unit: "pixel" | "percent",
): AnnotationForEditor {
  const annotation = {} as AnnotationForEditor;
  annotation.type = "Annotation";

  if (Array.isArray(webAnnotation.body)) {
    if (webAnnotation.body.length == 1) {
      annotation.body = {
        type: webAnnotation.body[0].type,
        value: webAnnotation.body[0].value,
        format: "text/plain",
      };
    } else if (webAnnotation.body.length > 1) {
      annotation.body = webAnnotation.body.map((ann) => {
        return {
          type: ann.type,
          value: ann.value,
          format: "text/plain",
        };
      });
    }
  }

  annotation.motivation = webAnnotation.body[0]
    ? webAnnotation.body[0].purpose
    : "commenting";
  annotation.target = {
    type: "SpecificResource",
    source: {
      id: canvasId,
      type: "Canvas",
      partOf: [
        {
          id: manifestId,
          type: "Manifest",
        },
      ],
    },
    selector: {
      type: webAnnotation.target?.selector.type,
      conformsTo: webAnnotation.target.selector.conformsTo,
      value: webAnnotation.target.selector.value.replace(`${unit}:`, ""),
    },
  };
  annotation.id = webAnnotation.id;

  return annotation;
}

export function convertIIIFAnnotationPageToWebAnnotations(
  savedAnnotation: AnnotationPageForEditor,
  unit: "pixel" | "percent",
): AnnotationForAnnotorious[] {
  const webAnnotations: AnnotationForAnnotorious[] = [];

  savedAnnotation.items?.forEach((ann) => {
    const annotationBody = ann.body;

    let body: AnnotationBodyAnnotorious[];
    if (!annotationBody) {
      body = [];
    } else if (Array.isArray(annotationBody)) {
      body = annotationBody.map((body) => {
        return { purpose: "commenting", type: body.type, value: body.value };
      });
    } else {
      body = [
        {
          purpose: "commenting",
          type: annotationBody.type,
          value: annotationBody.value,
        },
      ];
    }
    webAnnotations.push({
      "@context": "http://www.w3.org/ns/anno.jsonld",
      type: "Annotation",
      body: body,
      target: {
        source: ann.target.source,
        selector: {
          type: ann.target.selector.type,
          conformsTo: ann.target.selector.conformsTo,
          value: ann.target.selector.value.replace("xywh=", `xywh=${unit}:`),
        },
      },
      id: ann.id,
    });
  });

  return webAnnotations;
}
