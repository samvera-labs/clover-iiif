type Language = string;

export const label = (
  label: Record<Language, Array<string>>,
  language: string
) => {
  return label[language][0];
};
