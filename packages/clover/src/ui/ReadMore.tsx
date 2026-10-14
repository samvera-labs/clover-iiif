import React, {
  useEffect,
  useId,
  useLayoutEffect,
  useRef,
  useState,
} from "react";

import { useCloverTranslation } from "../i18n/useCloverTranslation";

/** A layout effect in the browser, an effect on the server (where there is no layout). */
const useIsomorphicLayoutEffect =
  typeof window === "undefined" ? useEffect : useLayoutEffect;

/**
 * "Read more" for text cut short. Its one child is clamped by its own CSS (a
 * `-webkit-line-clamp`, as `Summary` is: `components/Primitives/Primitives.css`); a
 * button under it, shown only once the text runs past that, opens it in full ("Read
 * more", `aria-expanded`) and cuts it short again ("Read less"). While open, the child
 * carries `data-read-more="open"`, which its clamp leaves alone.
 *
 * For text of your own: wrap one element (or a component that forwards its ref), and
 * clamp it in your CSS.
 *
 * ```tsx
 * <Clover.ReadMore>
 *   <p className="my-note">{text}</p>
 * </Clover.ReadMore>
 * ```
 */
export function ReadMore({ children }: { children: React.ReactElement }) {
  const { t } = useCloverTranslation();
  const ref = useRef<HTMLElement>(null);
  const fallbackId = useId();
  const [open, setOpen] = useState(false);
  const [cut, setCut] = useState(false);
  const child = React.Children.only(children);
  const id = (child.props as { id?: string }).id ?? fallbackId;

  // Cut short when what it holds is taller than the box its clamp leaves it.
  const measure = () => {
    const node = ref.current;
    if (node && !open) setCut(node.scrollHeight > node.clientHeight + 1);
  };
  // After every render (its text may have changed), and whenever it is resized.
  useIsomorphicLayoutEffect(measure);
  useEffect(() => {
    const node = ref.current;
    if (!node || typeof ResizeObserver === "undefined") return;
    const observer = new ResizeObserver(measure);
    observer.observe(node);
    return () => observer.disconnect();
    // `measure` reads the latest `open` through its closure, renewed with each render.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  return (
    <div className="clover-read-more">
      {React.cloneElement(
        child as React.ReactElement<Record<string, unknown>>,
        {
          ref,
          id,
          "data-read-more": open ? "open" : "",
        },
      )}
      {(cut || open) && (
        <button
          type="button"
          className="clover-read-more-button"
          aria-expanded={open}
          aria-controls={id}
          onClick={() => setOpen((value) => !value)}
        >
          {open ? t("readLess") : t("readMore")}
        </button>
      )}
    </div>
  );
}
