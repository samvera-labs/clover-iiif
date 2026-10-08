/**
 * Spread onto an element to take it, and everything in it, out of the tab order and the
 * accessibility tree. React 18's types predate `inert`, which browsers expect as a bare
 * attribute.
 */
export const inertWhen = (inert: boolean): Record<string, unknown> =>
  inert ? { inert: "" } : {};
