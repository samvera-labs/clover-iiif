import React, { useState, useEffect } from 'react';
import ReactDOM from 'react-dom';
import { Vault } from '@hyperion-framework/vault';
import { Manifest, ManifestNormalized } from '@hyperion-framework/types';
import Viewer from './components/Viewer/Viewer';

interface Props {
  id: string;
}
const sampleManifest: string =
  'https://raw.githubusercontent.com/mathewjordan/mirador-playground/main/assets/iiif/manifest/new_airliner_invalid.json';

const App: React.FC<Props> = ({ id }) => {
  const [manifest, setManifest] = useState<ManifestNormalized | undefined>();
  const [loaded, setLoaded] = useState(false);
  useEffect(() => {
    const vault = new Vault();
    vault
      .loadManifest(id)
      .then((data) => {
        setManifest(data);
        setLoaded(true);
      })
      .catch((error) => {
        console.error(`Manifest failed to load: ${error}`);
      });
  }, [loaded]);

  if (typeof manifest !== 'undefined') {
    return <Viewer manifest={manifest as unknown as Manifest} />;
  }

  return <>'A future user friendly loading component'</>;
};

ReactDOM.render(<App id={sampleManifest} />, document.getElementById('root'));

export default App;
