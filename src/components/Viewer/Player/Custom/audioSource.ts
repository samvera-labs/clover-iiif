/**
 * One WebAudio source node per media element, forever.
 *
 * `createMediaElementSource` may be called only once for a given element: a second call
 * throws, and the element's audio is then routed into a graph nobody is listening to, so it
 * goes silent permanently. React will re-run effects, so the node has to outlive them —
 * keyed weakly so a discarded element can still be collected.
 */
const sourceNodes = new WeakMap<
  HTMLMediaElement,
  { context: AudioContext; source: MediaElementAudioSourceNode }
>();

export function getAudioSource(media: HTMLMediaElement) {
  const existing = sourceNodes.get(media);
  if (existing) return existing;

  const Ctor =
    window.AudioContext ?? (window as any).webkitAudioContext ?? undefined;
  if (!Ctor) return undefined;

  try {
    const context: AudioContext = new Ctor();
    const source = context.createMediaElementSource(media);
    // Without this the element's audio never reaches the speakers.
    source.connect(context.destination);
    const entry = { context, source };
    sourceNodes.set(media, entry);
    return entry;
  } catch {
    // Already routed by something else, or blocked. Either way there is no waveform.
    return undefined;
  }
}
