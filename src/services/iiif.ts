// Get string from a IIIF pres 3 label by language code
type Language = string;

export const label = (label: Record<Language, Array<string>>, language: Language = 'en') => {
  if (label[language]) {
    if (label[language].length !== 0) {
      return label[language][0];
    }
  }
  return;
};
