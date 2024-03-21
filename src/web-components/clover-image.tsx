import React, { FC, useLayoutEffect, useRef } from "react";

import Image from "src/components/Image";
import register from "src/lib/preact-custom-element/preact-custom-element";

interface CloverImageAttributes {
  "aria-label"?: string;
  "is-tiled-image"?: boolean;
  src: string;
}

interface CloverImageWCProps {
  "aria-label"?: string;
  "is-tiled-image": boolean;
  src: string;
  __registerPublicApi: (component: HTMLElement) => void;
}

const CloverImageWebComponent: FC<
  CloverImageWCProps & CloverImageAttributes
> = (props) => {
  const webComponentRef = useRef<HTMLElement>();
  const {
    "aria-label": ariaLabel,
    "is-tiled-image": isTiledImage,
    src,
  } = props;

  useLayoutEffect(() => {
    if (props.__registerPublicApi) {
      // @ts-ignore
      props.__registerPublicApi((component) => {
        webComponentRef.current = component;
      });
    }
  }, [props, props.__registerPublicApi]);

  return <Image label={ariaLabel} isTiledImage={isTiledImage} src={src} />;
};

const cloverViewerWCProps = ["aria-label", "src", "is-tiled-image"];

if (typeof window !== "undefined") {
  register(CloverImageWebComponent, "clover-image", cloverViewerWCProps, {
    shadow: false,
    onConstruct: (instance: any) => {
      instance._props = {
        __registerPublicApi: (api: any) => {
          Object.assign(instance, api(instance));
        },
      };
    },
  });
}
