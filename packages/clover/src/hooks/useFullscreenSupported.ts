import { useSyncExternalStore } from "react";

import { isFullscreenSupported } from "../lib/fullscreen";

const subscribe = () => () => {};

/**
 * Whether Clover's root can go full screen here, so a control that cannot work is never
 * offered. Assumed on the server and while hydrating, so the markup matches; corrected on
 * the client straight after.
 */
export default function useFullscreenSupported(): boolean {
  return useSyncExternalStore(subscribe, isFullscreenSupported, () => true);
}
