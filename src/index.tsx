import React, { useState, useEffect } from "react";
import ReactDOM from "react-dom";
import { Vault } from "@hyperion-framework/vault";
import { Validator } from "@hyperion-framework/validator";
import { ManifestNormalized } from "@hyperion-framework/types";
import Viewer from "./components/Viewer/Viewer";

interface Props {
  id: string;
}

const App: React.FC<Props> = ({ id }) => {
  const [manifest, setManifest] = useState<ManifestNormalized | undefined>(
    undefined
  );
  const [loaded, setLoaded] = useState(false);
  useEffect(() => {
    const vault = new Vault();
    vault
      .loadManifest(id)
      .then((data) => {
        const validator = new Validator();
        if (!validator.validateManifest(data)) {
          console.log(
            `Manifest is not valid according IIIF Presentation API 3.0 specification.`
          );
        }
        setManifest(data);
        setLoaded(true);
      })
      .catch((error) => {
        console.log(`Manifest failed to load: ${error}`);
      });
  }, [loaded]);

  if (typeof manifest !== "undefined") {
    return <Viewer manifest={manifest} />;
  }

  return "A future user friendly loading component";
};

ReactDOM.render(
  <App id="https://raw.githubusercontent.com/mathewjordan/mirador-playground/main/assets/iiif/manifest/new_airliner.json" />,
  document.getElementById("root")
);

export default App;
