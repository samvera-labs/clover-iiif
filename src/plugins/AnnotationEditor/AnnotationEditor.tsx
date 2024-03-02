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
  fetchAnnotations,
  deleteAnnotation,
  updateAnnotation,
} from "src/plugins/AnnotationEditor/annotation-utils";
import OpenSeadragon from "openseadragon";

type PropType = {
  openSeadragonViewer: OpenSeadragon.Viewer | null;
  activeCanvas: string;
  token?: string;
  annotationServer?: string;
  manifest: any;
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

function RenderAnnotationEditor(props: PropType) {
  const {
    activeCanvas,
    openSeadragonViewer,
    token,
    annotationServer,
    manifest,
  } = props;

  const fragmentUnit = "pixel";

  useEffect(() => {
    if (!openSeadragonViewer) return;

    const options = {
      allowEmpty: true,
      fragmentUnit: fragmentUnit,

      widgets: ["COMMENT"],
    };

    const anno = Annotorious(openSeadragonViewer, options);
    AnnotoriousToolbar(anno, document.getElementById("my-toolbar-container"));
    anno.on("createAnnotation", (annotation) => {
      saveAnnotation(
        annotation,
        manifest.id,
        activeCanvas,
        fragmentUnit,
        token,
        annotationServer,
      );
    });
    anno.on("updateAnnotation", (annotation) => {
      updateAnnotation(
        annotation,
        manifest.id,
        activeCanvas,
        fragmentUnit,
        token,
        annotationServer,
      );
    });
    anno.on("deleteAnnotation", (annotation) => {
      deleteAnnotation(
        annotation,
        manifest.id,
        activeCanvas,
        fragmentUnit,
        token,
        annotationServer,
      );
    });

    // load existing annotations
    (async () => {
      const savedAnnotations = await fetchAnnotations(
        activeCanvas,
        fragmentUnit,
        token,
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
