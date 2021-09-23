type Language = string;

export const label = (
  label: Record<Language, Array<string>>,
  language: Language
) => {
  return label[language][0];
};
