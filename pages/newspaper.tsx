import Viewer from "docs/components/DynamicImports/Viewer";
import dynamic from "next/dynamic";
import InfomationPanel from "src/plugins/AnnotationEditor/InfomationPanel";
import { EditorProvider } from "src/plugins/AnnotationEditor/annotation-editor-context";
const AnnotationEditor = dynamic(
  () => import("src/plugins/AnnotationEditor/AnnotationEditor"),
  {
    ssr: false,
  },
);

const Newspaper = () => {
  return (
    <EditorProvider>
      <RenderNewspaper />
    </EditorProvider>
  );
};

function Demo() {
  return <div>Demo info panel</div>;
}

function RenderNewspaper() {
  return (
    <Viewer
      iiifContent="http://localhost:3000/manifest/newspaper/newspaper_collection.json"
      plugins={[
        {
          id: "AnnotationEditor",
          menu: {
            component: AnnotationEditor,
            componentProps: {
              annotationServer:
                "http://localhost:3000/api/annotationsByCanvas/1",
              token: "123abc",
            },
          },
          informationPanel: {
            component: InfomationPanel,
            label: { none: ["my clip"] },
            // displayIfNoAnnotations: false,
            componentProps: {
              annotationServer: "http://localhost:3000/api/annotations/1",
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
        ignoreAnnotationOverlaysLabels: ["Clippings"],
        informationPanel: { open: true },
        canvasHeight: "640px",
        openSeadragon: {
          gestureSettingsMouse: {
            scrollToZoom: true,
          },
        },
      }}
    />
  );
}

export default Newspaper;
