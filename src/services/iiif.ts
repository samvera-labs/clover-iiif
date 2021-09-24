import { InternationalString } from '@hyperion-framework/types';

// Get string from a IIIF pres 3 label by language code
export const getLabel = (label: InternationalString, language: string) => {
  if (label[language]) {
    return label[language][0];
  }
  return;
};
