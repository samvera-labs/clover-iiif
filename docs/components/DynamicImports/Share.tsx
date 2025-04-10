import CloverViewer from "docs/components/DynamicImports/Viewer";
import dynamic from "next/dynamic";
import { useState } from "react";

const Share = dynamic(() => import("src/components/Share"), {
  ssr: false,
});

export function CloverShare() {
  const iiifContent =
    "https://api.dc.library.northwestern.edu/api/v2/works/71153379-4283-43be-8b0f-4e7e3bfda275?as=iiif";
  const [contentState, setContentState] = useState({});

  return (
    <div>
      <Share contentState={contentState} />
      <CloverViewer
        iiifContent={iiifContent}
        contentStateCallback={(annotation) => setContentState(annotation)}
        options={{
          showTitle: false,
          informationPanel: {
            open: false,
            renderToggle: false,
          },
        }}
      />
    </div>
  );
}

export default CloverShare;
