/**
 * Test helper: an IntersectionObserver that reports every observed element as on screen
 * at once (or, with `onScreen: false`, never), so a Canvas loads as it would in view.
 * The suite-wide mock in `setupTests.ts` never reports at all.
 */
export function stubViewport({ onScreen = true } = {}) {
  const original = globalThis.IntersectionObserver;
  const observers: Array<{ callback: IntersectionObserverCallback }> = [];

  class StubObserver {
    constructor(readonly callback: IntersectionObserverCallback) {
      observers.push(this);
    }
    observe(target: Element) {
      if (onScreen) {
        this.callback(
          [{ isIntersecting: true, target } as IntersectionObserverEntry],
          this as unknown as IntersectionObserver,
        );
      }
    }
    unobserve() {}
    disconnect() {}
    takeRecords() {
      return [];
    }
  }

  globalThis.IntersectionObserver = StubObserver as any;
  return {
    /** Bring everything observed so far on screen. */
    scrollIntoView(target: Element) {
      observers.forEach((observer) =>
        observer.callback(
          [{ isIntersecting: true, target } as IntersectionObserverEntry],
          observer as unknown as IntersectionObserver,
        ),
      );
    },
    restore() {
      globalThis.IntersectionObserver = original;
    },
  };
}
