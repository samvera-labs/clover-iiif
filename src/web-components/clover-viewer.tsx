import React, { useLayoutEffect, useRef } from "react";

import Viewer from "src/components/Viewer";
import register from "src/lib/preact-custom-element/preact-custom-element";

interface CloverViewerAttributes {
  id: string;
  config: string;
}

interface CloverViewerWCProps {
  id: string;
  options: string;
  __registerPublicApi: (component: any) => void;
}

function CloverViewerWebComponent(
  props: CloverViewerWCProps & CloverViewerAttributes,
) {
  const webComponent = useRef<HTMLElement>();
  const { id, options } = props;

  useLayoutEffect(() => {
    if (props.__registerPublicApi) {
      props.__registerPublicApi((component: any) => {
        webComponent.current = component;
      });
    }
  }, []);

  // Parse options as JSON string
  const parsedOptions = options ? JSON.parse(options) : {};

  // @ts-ignore
  return <Viewer id={id} options={parsedOptions} />;
}

const cloverViewerWCProps = ["id"];

if (typeof window !== "undefined") {
  register(CloverViewerWebComponent, "clover-viewer", cloverViewerWCProps, {
    shadow: false,
    onConstruct(instance: any) {
      instance._props = {
        __registerPublicApi: (api: any) => {
          Object.assign(instance, api(instance));
        },
      };
    },
  });
}
