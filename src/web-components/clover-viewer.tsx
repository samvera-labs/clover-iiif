import React, { useLayoutEffect, useRef } from "react";

import Viewer from "src/components/Viewer";
import register from "src/lib/preact-custom-element/preact-custom-element";
import { ViewerConfigOptions } from "src/context/viewer-context";

interface CloverViewerAttributes {
  id: string;
  options?: ViewerConfigOptions;
  /** IIIF Manifest/Collection URL or content state */
  "iiif-content"?: string;
}

interface CloverViewerWCProps {
  id: string;
  "iiif-content"?: string;
  __registerPublicApi: (component: any) => void;
}

function CloverViewerWebComponent(
  props: CloverViewerWCProps & CloverViewerAttributes,
) {
  const webComponent = useRef<HTMLElement>();
  const { id, options } = props;
  const parsedOptions = JSON.parse(options as string);
  const iiifContent = props["iiif-content"];

  useLayoutEffect(() => {
    if (props.__registerPublicApi) {
      props.__registerPublicApi((component: any) => {
        webComponent.current = component;
      });
    }
  }, []);

  // @ts-ignore
  return (
    <Viewer id={id} iiifContent={iiifContent as any} options={parsedOptions} />
  );
}

const cloverViewerWCProps = ["id", "iiif-content"];

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
