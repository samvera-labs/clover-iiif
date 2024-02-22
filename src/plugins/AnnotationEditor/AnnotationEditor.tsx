import React, { useEffect } from "react";
import * as Annotorious from "@recogito/annotorious-openseadragon";
import * as AnnotoriousToolbar from "@recogito/annotorious-toolbar";
import "@recogito/annotorious-openseadragon/dist/annotorious.min.css";
import {
  CreateAnnotationProvider,
  defaultState,
} from "src/plugins/AnnotationEditor/annotation-editor-context";
import OpenSeadragon from "openseadragon";

type PropType = {
  openSeadragonViewer: OpenSeadragon.Viewer | null;
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

function RenderCreateAnnotation(props) {
  useEffect(() => {
    if (!props.openSeadragonViewer) return;

    const options = {
      allowEmpty: true,
      fragmentUnit: "percent",

      widgets: ["COMMENT"],
    };

    const anno = Annotorious(props.openSeadragonViewer, options);
    AnnotoriousToolbar(anno, document.getElementById("my-toolbar-container"));
    anno.on("createAnnotation", (annotation) => {
      console.log("created", annotation);
    });

    anno.on("updateAnnotation", (annotation, previous) => {
      console.log("updated", annotation, previous);
    });

    anno.on("deleteAnnotation", (annotation) => {
      console.log("deleted", annotation);
    });
  });

  return (
    <>
      <div id="my-toolbar-container"></div>
    </>
  );
}
