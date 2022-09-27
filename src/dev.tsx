import React, { StrictMode, useEffect, useState } from "react";
import App from "@/index";
import DynamicUrl from "@/dev/DynamicUrl";
import { createRoot } from "react-dom/client";
import { manifests } from "@/dev/manifests";

const Wrapper = () => {
  const defaultUrl: string = manifests[0].url;

  const [url, setUrl] = useState(defaultUrl);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const id = params.get("iiif-content");
    if (id) setUrl(id);
  }, []);

  const customTheme = {
    fonts: {
      display: `"Lora", "Inter", Arial, sans-serif`,
      sans: `"Inter", Arial, sans-serif`,
    },
  };

  return (
    <>
      <App
        id={url}
        key={url}
        customTheme={customTheme}
        options={{
          canvasBackgroundColor: "#e6e8eb",
          canvasHeight: "600px",
          renderAbout: true,
          showInformationToggle: true,
        }}
      />
      <DynamicUrl url={url} setUrl={setUrl} />
    </>
  );
};

const container = document.getElementById("root");
const root = createRoot(container!);

root.render(
  <StrictMode>
    <Wrapper />
  </StrictMode>,
);
