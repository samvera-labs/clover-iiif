import React, { useLayoutEffect, useRef } from "react";

import Viewer from "src/components/Viewer";
import register from "src/lib/preact-custom-element/preact-custom-element";

interface CloverViewerAttributes {
  id: string;
}

interface CloverViewerWCProps {
  id: string;
  __registerPublicApi: (component: any) => void;
}

function CloverViewerWebComponent(
  props: CloverViewerWCProps & CloverViewerAttributes,
) {
  const webComponent = useRef<HTMLElement>();
  const { id } = props;

  useLayoutEffect(() => {
    if (props.__registerPublicApi) {
      props.__registerPublicApi((component: any) => {
        webComponent.current = component;
      });
    }
  }, []);

  // @ts-ignore
  return <Viewer id={id} />;
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
