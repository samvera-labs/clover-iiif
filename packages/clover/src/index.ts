/*
 * @nulib/clover, used two ways:
 *
 *   - **The Viewer**, the default export, in a layout from `@nulib/clover/templates`:
 *
 *       import Viewer from "@nulib/clover";
 *       import { Document } from "@nulib/clover/templates";
 *
 *       <Viewer iiifContent={url} />                      // Default, loaded on demand
 *       <Viewer iiifContent={url} template={Document} />
 *
 *     The Viewer is a shell: a page ships only the template it uses.
 *
 *   - **The parts**, named exports, so `import * as Clover from "@nulib/clover"` gives dot
 *     notation (`<Clover.Root>`, `<Clover.Canvas />`) for a layout of your own. They
 *     tree-shake: a page that never renders the Viewer never ships a template.
 */

export * from "./parts";
export { Viewer, Viewer as default } from "./components/Viewer/Viewer";
export type { ViewerProps, ViewerTemplate } from "./components/Viewer/Viewer";
