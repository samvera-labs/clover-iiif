import React, { useState, useEffect } from "react";
import dynamic from "next/dynamic";
import { PluginInformationPanel } from "src/index";
import styles from "./InformationPanel.module.css";
import { useEditorState } from "./annotation-editor-context";

const AnnotationItem = dynamic(() => import("./AnnotationItem"), {
  ssr: false,
});

interface PropType extends PluginInformationPanel {
  token: string;
  annotationPageId: string[];
}

export const InfomationPanel: React.FC<PropType> = ({
  annotations,
  canvas,
  viewerConfigOptions,
  openSeadragonViewer,
  useViewerDispatch,
  useViewerState,
  token,
  annotationPageId,
}) => {
  const [activeTarget, setActiveTarget] = useState();
  const [clippings, setClippings] = useState(annotations);

  const editorState = useEditorState();
  const { clippingsUpdatedAt } = editorState;

  useEffect(() => {
    if (!clippingsUpdatedAt) return;

    const url = annotationPageId[0];
    fetch(url, {
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    })
      .then((res) => res.json())
      .then((newAnnotations) => {
        setClippings(newAnnotations.items);
      });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [clippingsUpdatedAt]);

  return (
    <div className={styles.container}>
      <p>
        Use the button to make a clipping. Clippings from this record is
        available below.
      </p>
      <p>
        <a href="">View all clippings.</a>
      </p>
      <p>Clippings from this record</p>
      {clippings?.map((clipping) => (
        <AnnotationItem
          key={clipping.id}
          annotation={clipping}
          canvas={canvas}
          viewerConfigOptions={viewerConfigOptions}
          openSeadragonViewer={openSeadragonViewer}
          useViewerState={useViewerState}
          useViewerDispatch={useViewerDispatch}
          activeTarget={activeTarget}
          setActiveTarget={setActiveTarget}
        />
      ))}
    </div>
  );
};

export default InfomationPanel;
