import { upgradeToPresentation4 } from "@iiif/parser/presentation-4/upgrader";

/**
 * A published fixture (most are Presentation 3 Cookbook recipes) as Clover holds it:
 * upgraded to Presentation 4. Tests read fixtures through this, as Clover reads the web.
 */
export const p4 = (resource: unknown): any => upgradeToPresentation4(resource);
