import Viewer from "docs/components/DynamicImports/Viewer";
import dynamic from "next/dynamic";
import InformationPanel from "src/plugins/AnnotationEditor/components/InformationPanel";
import { EditorProvider } from "src/plugins/AnnotationEditor/context/annotation-editor-context";
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
                  annotationServer: `${base_url}/api/annotationsByCanvas/1`,
                  token: "123abc",
                },
              },
            },
            informationPanel: {
              component: InformationPanel,
              label: { none: ["my clip"] },
              // displayIfNoAnnotations: false,
              componentProps: {
                annotationServer: `${base_url}/api/annotations/1`,
                token: "123abc",
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
