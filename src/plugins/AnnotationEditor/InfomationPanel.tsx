import React, { useState } from "react";
import dynamic from "next/dynamic";
import { PluginInformationPanel } from "src/index";
import styles from "./InformationPanel.module.css";

const AnnotationItem = dynamic(() => import("./AnnotationItem"), {
  ssr: false,
});

export const InfomationPanel: React.FC<PluginInformationPanel> = ({
  annotations,
  canvas,
  viewerConfigOptions,
  openSeadragonViewer,
  useViewerDispatch,
  useViewerState,
}) => {
  const [activeTarget, setActiveTarget] = useState();

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
      {annotations?.map((annotation) => (
        <AnnotationItem
          key={annotation.id}
          annotation={annotation}
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
