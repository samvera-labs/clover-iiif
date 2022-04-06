import React from "react";
import ReactDOM from "react-dom";
import App from "./index";
import DynamicUrl from "./dev/DynamicUrl";
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

ReactDOM.render(<Wrapper />, document.getElementById("root"));
