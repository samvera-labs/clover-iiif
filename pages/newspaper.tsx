import Viewer from "docs/components/DynamicImports/Viewer";
import dynamic from "next/dynamic";
import InformationPanel from "src/plugins/AnnotationEditor/components/InformationPanel";
import { EditorProvider } from "src/plugins/AnnotationEditor/context/annotation-editor-context";
import { useState, useEffect } from "react";
import { fetchAnnotations } from "src/plugins/AnnotationEditor/utils/annotation-utils";
import { AnnotationForEditor } from "src/plugins/AnnotationEditor/types/annotation";
const AnnotationEditor = dynamic(
  () => import("src/plugins/AnnotationEditor/components/AnnotationEditor"),
  {
    ssr: false,
  },
);

function Demo() {
  return <div>Demo info panel</div>;
}

function Newspaper() {
  const base_url = "http://localhost:3000";
  const annotationServer = `${base_url}/api/annotations/1`;
  const unit = "pixel";
  const token = "123abc";
  const [annotations, setAnnotations] = useState<AnnotationForEditor[]>([]);

  useEffect(() => {
    fetchAnnotations(unit, token, annotationServer).then((response) => {
      setAnnotations(response);
    });
  }, []);

  return (
    <EditorProvider>
      <Viewer
        iiifContent={`${base_url}/api/fixtures/newspaper/issue_1`}
        plugins={[
          {
            id: "AnnotationEditor",
            imageViewer: {
              menu: {
                component: AnnotationEditor,
                componentProps: {
                  annotationServer: annotationServer,
                  token: token,
                  annotations,
                },
              },
            },
            informationPanel: {
              component: InformationPanel,
              label: { none: ["my clip"] },
              componentProps: {
                annotationServer: annotationServer,
                token: token,
                annotations,
              },
            },
          },
          {
            id: "demo",
            informationPanel: {
              label: { none: ["My demo"] },
              component: Demo,
            },
          },
        ]}
        options={{
          // ignoreAnnotationOverlaysLabels: ["Clippings"],
          informationPanel: { open: true },
          canvasHeight: "640px",
          openSeadragon: {
            gestureSettingsMouse: {
              scrollToZoom: true,
            },
          },
        }}
      />
    </EditorProvider>
  );
}

export default Newspaper;
