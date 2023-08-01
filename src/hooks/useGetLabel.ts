import { InternationalString } from "@iiif/presentation-3";

export const useGetLabel = (
  label: InternationalString,
  language: string = "en"
) => {
  /*
   * If no label exists, return an empty string.
   */
  if (!label) return null;

  /*
   * If label is not a IIIF Presentation API shape, return the string
   */
  if (typeof label === "string") return [label];

  /*
   * If InternationalString code does not exist on label, then
   * return what may be there, ex: label.none[0] OR label.fr[0]
   */
  if (!label[language]) {
    const codes: Array<string> = Object.getOwnPropertyNames(label);
    if (codes.length > 0) return label[codes[0]];
  }

  /*
   * Return label value for InternationalString code `en`
   */
  return label[language];
};
