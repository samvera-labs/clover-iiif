/** Vite's asset queries, used by the web-components build entry. */
declare module "*?inline" {
  const css: string;
  export default css;
}
declare module "*?worker&url" {
  const url: string;
  export default url;
}
