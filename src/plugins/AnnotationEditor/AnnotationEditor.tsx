import React, { useEffect, useRef } from "react";
import * as Annotorious from "@recogito/annotorious-openseadragon";
import * as AnnotoriousToolbar from "@recogito/annotorious-toolbar";
import "@recogito/annotorious-openseadragon/dist/annotorious.min.css";
import {
  saveAnnotation,
  fetchAnnotations,
  deleteAnnotation,
  updateAnnotation,
} from "src/plugins/AnnotationEditor/annotation-utils";
import { type Plugin } from "src/index";

interface PropType extends Plugin {
  token?: string;
  annotationServer?: string;
}

export default function AnnotationEditor(props: PropType) {
  const { canvas, openSeadragonViewer, manifest, token, annotationServer } =
    props;
  const activeCanvas = canvas.id;
  const fragmentUnit = "pixel";
  const toolbarRef = useRef<null | HTMLDivElement>(null);

  // create Annotorious instance for each openSeadragonViewer instance
  useEffect(() => {
    if (!openSeadragonViewer) return;
    console.log("Annotorious setup");

    // set up Annotorious
    const options = {
      allowEmpty: true,
      fragmentUnit: fragmentUnit,
      widgets: ["COMMENT"],
    };
    const anno = Annotorious(openSeadragonViewer, options);

    // setup toolbar
    AnnotoriousToolbar(anno, document.getElementById("my-toolbar-container"), {
      drawingTools: ["rect"],
      withTooltip: true,
    });

    // set up CRUD
    anno.on("createAnnotation", (annotation) => {
      saveAnnotation(
        annotation,
        manifest.id,
        canvas.id,
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
    anno.setDrawingTool("rect");

    // load saved clippings
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
    const toolbarDOM = toolbarRef.current;

    // destroy Annotorious instance
    return () => {
      console.log("Annotorious destroy");
      anno.destroy();

      // remove the DOM elements added by Annotorious toolbar
      if (toolbarDOM) {
        toolbarDOM.innerHTML = "";
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [openSeadragonViewer]);

  return <div id="my-toolbar-container" ref={toolbarRef}></div>;
}
