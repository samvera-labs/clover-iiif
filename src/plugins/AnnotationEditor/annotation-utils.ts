export function saveAnnotation(annotation: any, activeCanvas, user = null) {
  if (!user) {
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

export function fetchAnnotation(activeCanvas: string, user = null) {
  if (!user) {
    let annotations: any = [];
    const savedAnnotations = window.localStorage.getItem("annotations");
    if (savedAnnotations) {
      const annotationsForCanvas = JSON.parse(savedAnnotations)[activeCanvas];
      if (annotationsForCanvas) {
        const webAnnotations = [] as any;

        annotationsForCanvas.items.forEach((ann) => {
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
        annotations = webAnnotations;
      }
    }

    return annotations;
  }
}

export function deleteAnnotation(
  annotation,
  activeCanvas: string,
  user = null,
) {
  if (!user) {
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

export function updateAnnotation(
  annotation,
  activeCanvas: string,
  user = null,
) {
  if (!user) {
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
