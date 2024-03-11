export async function saveAnnotation(
  webAnnotation: any,
  manifestId: string,
  activeCanvas: string,
  unit: "pixel" | "percent",
  token?: string,
  annotationServer?: string,
) {
  if (token && annotationServer) {
    await fetch(annotationServer, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        canvas: activeCanvas,
        annotation: convertWebAnnotation(
          webAnnotation,
          manifestId,
          activeCanvas,
          unit,
        ),
      }),
    });
  } else if (!token) {
    let annotations: any = {};
    const savedAnnotations = window.localStorage.getItem("annotations");
    if (savedAnnotations) {
      const annotationsObj = JSON.parse(savedAnnotations);
      if (annotationsObj[activeCanvas] == undefined) {
        annotationsObj[activeCanvas] = {
          id: activeCanvas,
          items: [],
          type: "AnnotationPage",
        };
      }
      annotationsObj[activeCanvas].items.push(
        convertWebAnnotation(webAnnotation, manifestId, activeCanvas, unit),
      );
      annotations = annotationsObj;
    } else {
      annotations[activeCanvas] = {
        id: activeCanvas,
        items: [
          convertWebAnnotation(webAnnotation, manifestId, activeCanvas, unit),
        ],
        type: "AnnotationPage",
      };
    }

    window.localStorage.setItem("annotations", JSON.stringify(annotations));
  }
}

export function convertWebAnnotation(
  webAnnotation: any,
  manifestId: string,
  canvasId: string,
  unit: "pixel" | "percent",
) {
  const annotation = {} as any;
  annotation.type = "Annotation";

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
  } else {
    annotation.body = {};
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
      type: webAnnotation.target.selector.type,
      conformsTo: webAnnotation.target.selector.conformsTo,
      value: webAnnotation.target.selector.value.replace(`${unit}:`, ""),
    },
  };
  annotation.id = webAnnotation.id;

  return annotation;
}

export async function fetchAnnotations(
  activeCanvas: string,
  unit: "pixel" | "percent",
  token?: string,
  annotationServer?: string,
) {
  let annotations: any = [];

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
      const savedAnnotation = await res.json();
      annotations = processSavedAnnotation(savedAnnotation, unit);
    } else {
      const error = await res.json();
      console.error(error);
    }
  } else if (!token) {
    const savedAnnotationsAll = window.localStorage.getItem("annotations");
    if (savedAnnotationsAll) {
      const savedAnnotation = JSON.parse(savedAnnotationsAll)[activeCanvas];
      if (savedAnnotation) {
        annotations = processSavedAnnotation(savedAnnotation, unit);
      }
    }
  }

  return annotations;
}

function processSavedAnnotation(savedAnnotation, unit: "pixel" | "percent") {
  const webAnnotations = [] as any;

  savedAnnotation.items.forEach((ann) => {
    let body;
    if (Array.isArray(ann.body)) {
      body = ann.body.map((b) => {
        return { purpose: "commenting", type: b.type, value: b.value };
      });
    } else {
      body = [
        { purpose: "commenting", type: ann.body.type, value: ann.body.value },
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

export async function deleteAnnotation(
  webAnnotation,
  manifestId: string,
  activeCanvas: string,
  unit: "pixel" | "percent",
  token?: string,
  annotationServer?: string,
) {
  if (token && annotationServer) {
    await fetch(annotationServer, {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        canvas: activeCanvas,
        annotation: convertWebAnnotation(
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
          (ann) => ann.id !== webAnnotation.id,
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
  webAnnotation,
  manifestId: string,
  activeCanvas: string,
  unit: "pixel" | "percent",
  token?: string,
  annotationServer?: string,
) {
  if (token && annotationServer) {
    await fetch(annotationServer, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        canvas: activeCanvas,
        annotation: convertWebAnnotation(
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
        selectedAnnotations.items.forEach((ann) => {
          if (ann.id === webAnnotation.id) {
            updatedAnnotations.push(
              convertWebAnnotation(
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
