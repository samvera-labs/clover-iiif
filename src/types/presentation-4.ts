import { InternationalString } from "@iiif/presentation-3";

export interface Model {
  type: "Model";
  id: string;
  format?: string;
  label?: InternationalString;
  width?: number;
  height?: number;
}

export interface Scene {
  type: "Scene";
  id: string;
  label?: InternationalString;
  duration?: number;
  items?: unknown[];
}

export interface TranslateTransform {
  type: "TranslateTransform";
  x: number;
  y: number;
  z: number;
}

export interface RotateTransform {
  type: "RotateTransform";
  x: number;
  y: number;
  z: number;
}

export interface ScaleTransform {
  type: "ScaleTransform";
  x: number;
  y: number;
  z: number;
}

export type Transform = TranslateTransform | RotateTransform | ScaleTransform;
