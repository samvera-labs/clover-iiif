import {
  IIIFExternalWebResource,
  InternationalString,
  MetadataItem,
} from "@iiif/presentation-3";
import React, { ReactElement, ReactNode } from "react";

export interface PrimitivesPrimitive
  extends React.HTMLAttributes<HTMLElement> {}

export interface PrimitivesCustomValueContent {
  matchingLabel: InternationalString;
  Content: ReactElement;
}

export interface PrimitivesMetadataItem extends PrimitivesPrimitive {
  item: MetadataItem;
  customValueContent?: ReactElement;
  customValueDelimiter?: string;
}

export interface PrimitivesContentResource extends PrimitivesPrimitive {
  altAsLabel?: InternationalString;
  contentResource: PrimitivesExternalWebResource;
  region?: string;
}

export interface PrimitivesExternalWebResource {
  id: string;
  type: "Dataset" | "Image" | "Video" | "Sound" | "Text";
  format?: string;
  label?: InternationalString;
  language?: string | string[];
  duration?: number;
  width?: number;
  height?: number;
  profle?: string;
}

export interface PrimitivesIIIFResource {
  id: string;
  type: "Collection" | "Manifest";
  label?: InternationalString | undefined;
}

export interface PrimitivesHomepage extends PrimitivesPrimitive {
  children?: ReactNode | ReactNode[];
  homepage: PrimitivesExternalWebResource[];
}

export interface PrimitivesLabel extends PrimitivesPrimitive {
  as?:
    | "dd"
    | "dt"
    | "figcaption"
    | "h1"
    | "h2"
    | "h3"
    | "h4"
    | "h5"
    | "h6"
    | "label"
    | "p"
    | "span";
  label: InternationalString;
}

export interface PrimitivesMarkup extends PrimitivesPrimitive {
  as?: "span" | "p" | "label" | "h1" | "h2" | "h3" | "h4" | "h5" | "h6" | "dd";
  markup?: InternationalString;
}

export interface PrimitivesMetadata extends PrimitivesPrimitive {
  as?: "dl";
  customValueContent?: PrimitivesCustomValueContent[];
  customValueDelimiter?: string;
  metadata: MetadataItem[];
}

export interface PrimitivesPartOf extends PrimitivesPrimitive {
  as?: "ol" | "ul";
  partOf: PrimitivesIIIFResource[];
}

export interface PrimitivesRendering extends PrimitivesPrimitive {
  as?: "ol" | "ul";
  rendering: PrimitivesExternalWebResource[];
}

export interface PrimitivesRequiredStatement extends PrimitivesPrimitive {
  as?: "dl";
  customValueDelimiter?: string;
  requiredStatement: MetadataItem;
}

export interface PrimitivesSeeAlso extends PrimitivesPrimitive {
  as?: "ol" | "ul";
  seeAlso: PrimitivesExternalWebResource[];
}

export interface PrimitivesSummary extends PrimitivesPrimitive {
  as?: "span" | "p" | "label" | "h1" | "h2" | "h3" | "h4" | "h5" | "h6";
  customValueDelimiter?: string;
  summary: InternationalString;
}

export interface PrimitivesThumbnail extends PrimitivesPrimitive {
  altAsLabel?: InternationalString;
  region?: string;
  thumbnail: IIIFExternalWebResource[];
}

export interface PrimitivesValue extends PrimitivesPrimitive {
  as?: "span" | "dd";
  value: InternationalString;
}

export interface PrimitivesCustomValue extends PrimitivesValue {
  customValueContent: ReactElement;
}
