/**
 * The smallest store Clover needs: state, a way to change it, and subscribers. React reads
 * it through `useSyncExternalStore`, so a part re-renders only when what it selected
 * changed.
 */
export interface Store<State> {
  get(): State;
  /** Merge a patch. Subscribers hear of it only if some value actually changed. */
  set(patch: Partial<State> | ((state: State) => Partial<State>)): void;
  subscribe(listener: () => void): () => void;
}

export function createStore<State extends object>(
  initial: State,
): Store<State> {
  let state = initial;
  const listeners = new Set<() => void>();
  return {
    get: () => state,
    set(patch) {
      const next = typeof patch === "function" ? patch(state) : patch;
      const changed = Object.keys(next).some(
        (key) => !Object.is(next[key], state[key]),
      );
      if (!changed) return;
      state = { ...state, ...next };
      listeners.forEach((listener) => listener());
    },
    subscribe(listener) {
      listeners.add(listener);
      return () => listeners.delete(listener);
    },
  };
}

/**
 * A stream of values that change too often for the store: the viewport on every frame,
 * the media element and its time. Emitting never touches the store, so panning or playback
 * re-renders nothing that has not subscribed.
 */
export interface Channel<Value> {
  get(): Value;
  emit(value: Value): void;
  subscribe(listener: (value: Value) => void): () => void;
}

export function createChannel<Value>(initial: Value): Channel<Value> {
  let value = initial;
  const listeners = new Set<(value: Value) => void>();
  return {
    get: () => value,
    emit(next) {
      value = next;
      listeners.forEach((listener) => listener(next));
    },
    subscribe(listener) {
      listeners.add(listener);
      return () => listeners.delete(listener);
    },
  };
}
