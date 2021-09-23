import React, { useState, useEffect } from "react";
import ReactDOM from "react-dom";
import { Vault } from "@hyperion-framework/vault";
import Viewer from "./components/Viewer/Viewer";
import { getManifest } from "services/iiif";

interface Props {
  id: string;
}

const App: React.FC<Props> = ({ id }) => {
  const [manifest, setManifest] = useState(null);
  useEffect(() => {
    const vault = new Vault();
    vault
      .loadManifest(id)
      .then(async (data) => {
        setManifest(data);
      })
      .catch((error) => {
        console.log(`Manifest failed to load: ${error}`);
      });
  });

  return <Viewer manifest={manifest} />;
};

ReactDOM.render(
  <App id="https://raw.githubusercontent.com/mathewjordan/mirador-playground/main/assets/iiif/manifest/new_airliner.json" />,
  document.getElementById("root")
);

export default App;
