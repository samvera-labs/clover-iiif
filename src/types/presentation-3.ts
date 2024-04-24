import {
  IIIFExternalWebResource,
  InternationalString,
} from "@iiif/presentation-3";

export interface LabeledIIIFExternalWebResource
  extends IIIFExternalWebResource {
  label?: InternationalString;
}

export type RenderingItem = WithLabel<IIIFExternalWebResource>;

export type WithLabel<T> = T & {
  label: InternationalString;
};
