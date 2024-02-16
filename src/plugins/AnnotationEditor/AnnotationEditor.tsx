import React, { useEffect } from "react";
import * as Annotorious from "@recogito/annotorious-openseadragon";
import * as AnnotoriousToolbar from "@recogito/annotorious-toolbar";
import "@recogito/annotorious-openseadragon/dist/annotorious.min.css";
import {
  CreateAnnotationProvider,
  defaultState,
} from "src/plugins/AnnotationEditor/annotation-editor-context";
import {
  saveAnnotation,
  fetchAnnotation,
  deleteAnnotation,
  updateAnnotation,
} from "src/plugins/AnnotationEditor/annotation-utils";
import OpenSeadragon from "openseadragon";

type PropType = {
  openSeadragonViewer: OpenSeadragon.Viewer | null;
  activeCanvas: string;
  userId?: string;
  annotationServer?: string;
};

export default function CreateAnnotation(props: PropType) {
  const options = {};

  return (
    <CreateAnnotationProvider
      initialState={{
        ...defaultState,
        ...options,
      }}
    >
      <RenderCreateAnnotation {...props} />
    </CreateAnnotationProvider>
  );
}

function RenderCreateAnnotation(props: PropType) {
  const { activeCanvas, openSeadragonViewer, userId, annotationServer } = props;
  useEffect(() => {
    if (!openSeadragonViewer) return;

    const options = {
      allowEmpty: true,
      fragmentUnit: "percent",

      widgets: ["COMMENT"],
    };

    const anno = Annotorious(openSeadragonViewer, options);
    AnnotoriousToolbar(anno, document.getElementById("my-toolbar-container"));
    anno.on("createAnnotation", (annotation) => {
      saveAnnotation(annotation, activeCanvas, userId, annotationServer);
    });
    anno.on("updateAnnotation", (annotation) => {
      updateAnnotation(annotation, activeCanvas, userId, annotationServer);
    });
    anno.on("deleteAnnotation", (annotation) => {
      deleteAnnotation(annotation, activeCanvas, userId, annotationServer);
    });

    // load existing annotations
    (async () => {
      const savedAnnotations = await fetchAnnotation(
        activeCanvas,
        userId,
        annotationServer,
      );
      savedAnnotations.forEach((annotation) => {
        try {
          anno.addAnnotation(annotation);
        } catch (error) {
          console.log(error);
        }
      });
    })();

    // Cleanup: destroy current instance
    return () => anno.destroy();
  }, [openSeadragonViewer, activeCanvas]);

  return (
    <>
      <div id="my-toolbar-container"></div>
    </>
  );
}
