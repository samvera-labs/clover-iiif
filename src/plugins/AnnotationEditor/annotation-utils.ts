export function saveAnnotation(annotation: any, activeCanvas, user = null) {
  if (!user) {
    let annotations: any = {};
    const savedAnnotations = window.localStorage.getItem("annotations");
    if (savedAnnotations) {
      const annotationsObj = JSON.parse(savedAnnotations);
      if (annotationsObj[activeCanvas] == undefined) {
        annotationsObj[activeCanvas] = [];
      }
      annotationsObj[activeCanvas].push(annotation);
      annotations = annotationsObj;
    } else {
      annotations[activeCanvas] = [annotation];
    }

    window.localStorage.setItem("annotations", JSON.stringify(annotations));
  }
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
            updatedAnnotations.push(annotation);
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
