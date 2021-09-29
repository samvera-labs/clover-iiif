import { InternationalString } from "@hyperion-framework/types";

// Get string from a IIIF pres 3 label by language code
export const getLabel = (
  label: InternationalString,
  language: string = "en",
) => {
  return label[language];
};

export const getCanvasByCriteria = (
  motivation: string,
  contentResourceType: Array<string>,
) => {
  return;
};
