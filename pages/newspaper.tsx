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
  const [annotations, setAnnotations] = useState<AnnotationForEditor[]>([]);

  useEffect(() => {
    const url = `${base_url}/api/annotations/1`;
    fetchAnnotations("123abc", url).then((response) => {
      setAnnotations(response);
    });
  }, []);

  return (
    <EditorProvider>
      <Viewer
        iiifContent={`${base_url}/api/newspaper/collection`}
        plugins={[
          {
            id: "AnnotationEditor",
            imageViewer: {
              menu: {
                component: AnnotationEditor,
                componentProps: {
                  annotationServer: `${base_url}/api/annotations/1`,
                  token: "123abc",
                  annotations,
                },
              },
            },
            informationPanel: {
              component: InformationPanel,
              label: { none: ["my clip"] },
              componentProps: {
                annotationServer: `${base_url}/api/annotations/1`,
                token: "123abc",
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
