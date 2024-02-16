function formatUrl(
  activeCanvas: string,
  user: string,
  annotationServer: string,
) {
  return `${annotationServer}/?userId=${user}&canvas=${formatCanvasId(
    activeCanvas,
  )}`;
}

function formatCanvasId(activeCanvas) {
  return activeCanvas
    .replaceAll("/", "")
    .replaceAll("http", "")
    .replaceAll(":", "");
}

export async function saveAnnotation(
  annotation: any,
  activeCanvas: string,
  user?: string,
  annotationServer?: string,
) {
  if (user && annotationServer) {
    await fetch(formatUrl(activeCanvas, user, annotationServer), {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(convertWebAnnotation(annotation)),
    });
  } else if (!user) {
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
      annotationsObj[activeCanvas].items.push(convertWebAnnotation(annotation));
      annotations = annotationsObj;
    } else {
      annotations[activeCanvas] = {
        id: activeCanvas,
        items: [convertWebAnnotation(annotation)],
        type: "AnnotationPage",
      };
    }

    window.localStorage.setItem("annotations", JSON.stringify(annotations));
  }
}

function convertWebAnnotation(webAnnotation) {
  const annotation = {} as any;

  if (webAnnotation.body.length == 1) {
    annotation.body = {
      type: webAnnotation.body[0].type,
      value: webAnnotation.body[0].value,
    };
  } else if (webAnnotation.body.length > 1) {
    annotation.body = webAnnotation.body.map((ann) => {
      return {
        type: ann.type,
        value: ann.value,
      };
    });
  }

  annotation.id = webAnnotation.id;
  annotation.motivation = webAnnotation.body[0].purpose;
  annotation.target = {
    source: webAnnotation.target.source,
    selector: {
      type: webAnnotation.target.selector.type,
      value: webAnnotation.target.selector.value,
    },
  };
  annotation.type = "Annotation";

  return annotation;
}

export async function fetchAnnotation(
  activeCanvas: string,
  user?: string,
  annotationServer?: string,
) {
  let annotations: any = [];

  if (user && annotationServer) {
    const res = await fetch(formatUrl(activeCanvas, user, annotationServer));
    const savedAnnotation = await res.json();
    annotations = processSavedAnnotation(savedAnnotation);
  } else if (!user) {
    const savedAnnotationsAll = window.localStorage.getItem("annotations");
    if (savedAnnotationsAll) {
      const savedAnnotation = JSON.parse(savedAnnotationsAll)[activeCanvas];
      if (savedAnnotation) {
        annotations = processSavedAnnotation(savedAnnotation);
      }
    }
  }

  return annotations;
}

function processSavedAnnotation(savedAnnotation) {
  const webAnnotations = [] as any;

  savedAnnotation.items.forEach((ann) => {
    let body;
    if (Array.isArray(ann.body)) {
      body = ann.body.map((b) => {
        return { ...b, purpose: "commenting" };
      });
    } else {
      body = [{ ...ann.body, purpose: "commenting" }];
    }
    webAnnotations.push({
      "@context": "http://www.w3.org/ns/anno.jsonld",
      type: "Annotation",
      body: body,
      target: {
        ...ann.target,
        selector: {
          ...ann.target.selector,
          conformsTo: "http://www.w3.org/TR/media-frags/",
        },
      },
      id: ann.id,
    });
  });
  return webAnnotations;
}

export async function deleteAnnotation(
  annotation,
  activeCanvas: string,
  user?: string,
  annotationServer?: string,
) {
  if (user && annotationServer) {
    await fetch(formatUrl(activeCanvas, user, annotationServer), {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(convertWebAnnotation(annotation)),
    });
  } else if (!user) {
    const savedAnnotations = window.localStorage.getItem("annotations");
    if (savedAnnotations) {
      const annotations = JSON.parse(savedAnnotations);
      const selectedAnnotations = annotations[activeCanvas];
      if (selectedAnnotations) {
        const otherAnnotations = selectedAnnotations.items.filter(
          (ann) => ann.id !== annotation.id,
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
  annotation,
  activeCanvas: string,
  user?: string,
  annotationServer?: string,
) {
  if (user && annotationServer) {
    await fetch(formatUrl(activeCanvas, user, annotationServer), {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(convertWebAnnotation(annotation)),
    });
  } else if (!user) {
    const savedAnnotations = window.localStorage.getItem("annotations");
    if (savedAnnotations) {
      const annotations = JSON.parse(savedAnnotations);
      const selectedAnnotations = annotations[activeCanvas];
      if (selectedAnnotations) {
        const updatedAnnotations: any = [];
        selectedAnnotations.items.forEach((ann) => {
          if (ann.id === annotation.id) {
            updatedAnnotations.push(convertWebAnnotation(annotation));
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
