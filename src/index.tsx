import React from "react";
import ReactDOM from "react-dom";
import Viewer from "./components/Viewer/Viewer";

interface Props {
  manifestId: string;
}

const App: React.FC<Props> = ({ manifestId }) => {
  return (
    <Viewer
      manifest={{
        label: {
          en: ["manifest.label"],
        },
      }}
    />
  );
};

ReactDOM.render(
  <App manifestId="https://uri.for/manifest.json" />,
  document.getElementById("root")
);

export default App;
