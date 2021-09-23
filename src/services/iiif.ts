import { Vault } from "@hyperion-framework/vault";
import { Validator } from "@hyperion-framework/validator";

// Fetch manifest from URI, return manifest JSON
export const getManifest = (uri: string) => {
  const vault = new Vault();
  return vault
    .loadManifest(uri)
    .then((manifest) => {
      return manifest;
    })
    .catch((error) => {
      console.log(`Manifest failed to load: ${error}`);
    });
};

// Validates IIIF manifest to Presentation 3.0 specifications
export const validateManifest = (manifest: object) => {
  const validator = new Validator();
  return validator.validateManifest(manifest);
};

// Get string from a IIIF pres 3 label by language code
type Language = string;

export const label = (
  label: Record<Language, Array<string>>,
  language: Language
) => {
  return label[language][0];
};
