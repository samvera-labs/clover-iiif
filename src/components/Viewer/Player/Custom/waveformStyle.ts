// Share the bar geometry across decoded waveforms, progressive peaks, and HLS frequency bars.
export const BAR_WIDTH = 4;
export const BAR_GAP = 2;

/**
 * The unplayed wave, anchored rather than themed.
 *
 * The waveform paints on the canvas background (a translucent `#0001` by default) under
 * the bar's dark scrim, whatever the page theme is. A colour token would invert with the
 * theme — the same reasoning as the control bar's palette, and it reads from the same custom
 * property so the two stay in step. Progress stays on `accent`, a brand colour.
 */
const WAVE_FALLBACK = "rgb(255 255 255 / 45%)";

export function resolveWaveColor(element?: Element | null) {
  if (typeof window === "undefined") return WAVE_FALLBACK;
  const scope = element ?? document.documentElement;
  const value = window
    .getComputedStyle(scope)
    .getPropertyValue("--clover-player-track")
    .trim();
  return value || WAVE_FALLBACK;
}
