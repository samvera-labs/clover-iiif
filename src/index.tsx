import React from "react";
import ReactDOM from "react-dom";
import Viewer from "./components/Viewer/Viewer";
import Player from "./components/Player/Player";

interface Props {
  manifestId: string;
}

const App: React.FC<Props> = ({ manifestId }) => {
  return (
    <>
      <Viewer
        manifest={{
          label: {
            en: ["manifest.label"],
          },
        }}
      />
    </>
  );
};

ReactDOM.render(
  <App manifestId="https://uri.for/manifest.json" />,
  document.getElementById("root")
);
