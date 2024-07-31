import resources from "./resources.ts";

declare module "i18next" {
  interface CustomTypeOptions {
    resources: typeof resources;
  }
}
