import React, { useEffect, useState } from "react";
import * as Annotorious from "@recogito/annotorious-openseadragon";
import "@recogito/annotorious-openseadragon/dist/annotorious.min.css";
import {
  saveAnnotation,
  fetchAnnotations,
  deleteAnnotation,
  updateAnnotation,
} from "src/plugins/AnnotationEditor/annotation-utils";
import { type Plugin } from "src/index";
import { useEditorDispatch } from "./annotation-editor-context";
import styles from "./AnnotationEditor.module.css";

interface PropType extends Plugin {
  token?: string;
  annotationServer?: string;
}

export default function AnnotationEditor(props: PropType) {
  const {
    canvas,
    openSeadragonViewer,
    activeManifest,
    token,
    annotationServer,
  } = props;

  const [active, setActive] = useState(false);
  const [editor, setEditor] = useState<any>();
  const editorDispatch: any = useEditorDispatch();

  const activeCanvas = canvas.id;
  const fragmentUnit = "pixel";

  // create Annotorious instance for each openSeadragonViewer instance
  useEffect(() => {
    if (!openSeadragonViewer) return;

    // set up Annotorious
    const options = {
      allowEmpty: true,
      fragmentUnit: fragmentUnit,
      widgets: ["COMMENT"],
    };
    const anno = Annotorious(openSeadragonViewer, options);

    // set up CRUD
    anno.on("createAnnotation", (annotation) => {
      saveAnnotation(
        annotation,
        activeManifest,
        canvas.id,
        fragmentUnit,
        token,
        annotationServer,
      ).then(() => {
        editorDispatch({
          type: "updateClippingsUpdatedAt",
          clippingsUpdatedAt: new Date().getTime(),
        });
      });
    });
    anno.on("updateAnnotation", (annotation) => {
      updateAnnotation(
        annotation,
        activeManifest,
        activeCanvas,
        fragmentUnit,
        token,
        annotationServer,
      ).then(() => {
        editorDispatch({
          type: "updateClippingsUpdatedAt",
          clippingsUpdatedAt: new Date().getTime(),
        });
      });
    });
    anno.on("deleteAnnotation", (annotation) => {
      deleteAnnotation(
        annotation,
        activeManifest,
        activeCanvas,
        fragmentUnit,
        token,
        annotationServer,
      ).then(() => {
        editorDispatch({
          type: "updateClippingsUpdatedAt",
          clippingsUpdatedAt: new Date().getTime(),
        });
      });
    });

    // set menu button to inactive after drawing selectionbox
    anno.on("createSelection", () => {
      setActive(false);
    });
    setEditor(anno);

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

    // destroy Annotorious instance
    return () => {
      anno.destroy();
    };

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [openSeadragonViewer]);

  function clickHandler() {
    editor.setDrawingTool("rect");
    editor.setDrawingEnabled(!active);
    setActive(!active);
  }

  if (!editor) return <></>;

  return (
    <button
      onClick={clickHandler}
      className={`${active && styles.active} ${styles.toolbarBtn}`}
    >
      <svg viewBox="0 0 80 80">
        <g>
          <rect x="18" y="25" width="46" height="30"></rect>
          <g className="handles">
            <circle cx="18" cy="25" r="5"></circle>
            <circle cx="64" cy="25" r="5"></circle>
            <circle cx="18" cy="55" r="5"></circle>
            <circle cx="64" cy="55" r="5"></circle>
          </g>
        </g>
      </svg>
    </button>
  );
}
