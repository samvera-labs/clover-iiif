import { InternationalString } from "@iiif/presentation-3";
import { PrimitivesCustomValueContent } from "../types/primitives";
import { getLabelAsString } from "./label-helpers";

export function parseCustomContent(
  label: InternationalString,
  valueArray: PrimitivesCustomValueContent[],
) {
  const customContent = valueArray
    .filter((entry) => {
      const { matchingLabel } = entry;
      const lang = Object.keys(entry.matchingLabel)[0];
      const labelPattern = getLabelAsString(matchingLabel, lang);

      if (getLabelAsString(label, lang) === labelPattern) return true;
    })
    .map((entry) => entry.Content);

  if (!Array.isArray(customContent)) return;

  return customContent[0];
}
