export function saveAnnotation(annotation: any, activeCanvas, user = null) {
  if (!user) {
    let annotations: any = {};
    const savedAnnotations = window.localStorage.getItem("annotations");
    if (savedAnnotations) {
      const annotationsObj = JSON.parse(savedAnnotations);
      if (annotationsObj[activeCanvas] == undefined) {
        annotationsObj[activeCanvas] = [];
      }
      annotationsObj[activeCanvas].push(convertWebAnnotation(annotation));
      annotations = annotationsObj;
    } else {
      annotations[activeCanvas] = [convertWebAnnotation(annotation)];
    }

    window.localStorage.setItem("annotations", JSON.stringify(annotations));
  }
}

function convertWebAnnotation(webAnnotation) {
  return {
    body: {
      type: webAnnotation.body[0].type,
      value: webAnnotation.body[0].value,
    },
    id: webAnnotation.id,
    motivation: webAnnotation.body[0].purpose,
    target: {
      source: webAnnotation.target.source,
      selector: {
        type: webAnnotation.target.selector.type,
        value: webAnnotation.target.selector.value,
      },
    },
    type: "Annotation",
  };
}

export function fetchAnnotation(activeCanvas: string, user = null) {
  if (!user) {
    let annotations: any = [];
    const savedAnnotations = window.localStorage.getItem("annotations");
    if (savedAnnotations) {
      annotations = JSON.parse(savedAnnotations)[activeCanvas] || [];
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
        const otherAnnotations = selectedAnnotations.filter(
          (ann) => ann.id !== annotation.id,
        );
        annotations[activeCanvas] = otherAnnotations;
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
        selectedAnnotations.forEach((ann) => {
          if (ann.id === annotation.id) {
            updatedAnnotations.push(convertWebAnnotation(annotation));
          } else {
            updatedAnnotations.push(ann);
          }
        });
        annotations[activeCanvas] = updatedAnnotations;
        window.localStorage.setItem("annotations", JSON.stringify(annotations));
      }
    }
  }
}
