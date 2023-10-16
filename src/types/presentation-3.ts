import {
  IIIFExternalWebResource,
  InternationalString,
} from "@iiif/presentation-3";

export interface LabeledIIIFExternalWebResource
  extends IIIFExternalWebResource {
  label?: InternationalString;
}
