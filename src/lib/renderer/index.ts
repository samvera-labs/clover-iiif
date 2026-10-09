export {
  CanvasRenderer,
  type BackendPreference,
  type CanvasRendererEvent,
  type CanvasRendererOptions,
  type SceneImage,
} from "src/lib/renderer/CanvasRenderer";
export type { BackendKind } from "src/lib/renderer/backends/backend";
export type { CameraState } from "src/lib/renderer/camera/Camera";
export type { GestureOptions } from "src/lib/renderer/input/GestureController";
export type { Point } from "src/lib/renderer/math/affine";
export type { Rect } from "src/lib/renderer/math/rect";
export {
  findImageServiceId,
  parseInfo,
  serviceBase,
  type ImageServiceInfo,
} from "src/lib/renderer/sources/imageService";
