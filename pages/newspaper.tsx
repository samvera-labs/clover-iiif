import React from "react";

import Viewer from "docs/components/DynamicImports/Viewer";

function Newspaper() {
  const iiifContent =
    "http://localhost:3000/manifest/newspaper/newspaper_collection.json";

  return (
    <Viewer
      iiifContent={iiifContent}
      options={{ informationPanel: { renderAbout: false } }}
    />
  );
}

export default Newspaper;
