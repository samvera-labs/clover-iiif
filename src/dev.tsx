import React from "react";
import App from "./index";
import DynamicUrl from "./dev/DynamicUrl";
import { createRoot } from "react-dom/client";
import { manifests } from "./dev/manifests";

const Wrapper = () => {
  const defaultUrl: string = manifests[0].url;

  const [url, setUrl] = React.useState(defaultUrl);
  return (
    <>
      <App manifestId={url} key={url} />
      <DynamicUrl url={url} setUrl={setUrl} />
    </>
  );
};

const container = document.getElementById("root");
const root = createRoot(container!); // createRoot(container!) if you use TypeScript
root.render(<Wrapper />);
