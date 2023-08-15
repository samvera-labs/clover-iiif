import * as IIIF from "src/components/Primitives";
import ReactDOMServer from "react-dom/server";

const LabelExample = () => {
  return (
    <IIIF.Label label={{ none: ["Crossing the Pend d'Oreille - Kalispel"] }} />
  );
};

const RenderedHTML = () => {
  return ReactDOMServer.renderToString(<LabelExample />);
};

export { LabelExample, RenderedHTML };
