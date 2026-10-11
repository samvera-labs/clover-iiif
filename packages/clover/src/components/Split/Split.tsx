import React, {
  createContext,
  forwardRef,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";

import { useCloverTranslation } from "../../i18n/useCloverTranslation";

/** A length: pixels as a number, or a CSS length in `px`, `rem` or `%` of the split. */
export type SplitLength = number | string;

/** How far an arrow key moves the handle; four times that with Shift. */
const KEY_STEP_REM = 1;

interface PaneSpec {
  min?: SplitLength;
  max?: SplitLength;
  size?: SplitLength;
}

interface SplitContextValue {
  /** Each sized pane's width in pixels, once the reader has moved its handle. */
  sizes: Record<string, number>;
  setSize: (key: string, px: number | undefined) => void;
  /** What each pane asked for, by key, for the handle to clamp against. */
  specs: React.MutableRefObject<Record<string, PaneSpec>>;
  element: React.MutableRefObject<HTMLElement | null>;
}

const SplitContext = createContext<SplitContextValue | null>(null);

const rootFontSize = () =>
  typeof document === "undefined"
    ? 16
    : parseFloat(getComputedStyle(document.documentElement).fontSize) || 16;

/** A length in pixels, against the split's own width for `%`. */
export function toPixels(
  length: SplitLength | undefined,
  across: number,
): number | undefined {
  if (length === undefined) return undefined;
  if (typeof length === "number") return length;
  const value = parseFloat(length);
  if (Number.isNaN(value)) return undefined;
  if (length.endsWith("rem")) return value * rootFontSize();
  if (length.endsWith("%")) return (value / 100) * across;
  return value;
}

const cssLength = (length: SplitLength | undefined) =>
  typeof length === "number" ? `${length}px` : length;

const read = (storageKey?: string): Record<string, number> => {
  if (!storageKey || typeof localStorage === "undefined") return {};
  try {
    const stored = JSON.parse(localStorage.getItem(storageKey) ?? "{}");
    return stored && typeof stored === "object" ? stored : {};
  } catch {
    return {};
  }
};

/** Hands `node` to a forwarded ref of either kind. */
function assign<T>(ref: React.ForwardedRef<T>, node: T | null) {
  if (typeof ref === "function") ref(node);
  else if (ref) ref.current = node;
}

export type SplitProps = React.HTMLAttributes<HTMLElement> & {
  as?: React.ElementType;
  /**
   * Remember the sizes the reader drags to, in `localStorage` under this key, so the
   * same layout opens at them next time.
   */
  storageKey?: string;
};

/**
 * Panes side by side, divided by handles the reader drags (or moves by keyboard) to share
 * the width between them. One pane beside each handle is given a `size`; the other takes
 * what is left. Not tied to any part: split the stage from the information panel, or
 * anything from anything.
 *
 * ```jsx
 * <Clover.Split>
 *   <Clover.SplitPane min="16rem"><Clover.Content /></Clover.SplitPane>
 *   <Clover.SplitHandle />
 *   <Clover.SplitPane size="24rem" min="14rem"><Clover.InformationPanel /></Clover.SplitPane>
 * </Clover.Split>
 * ```
 *
 * Without the stylesheet the panes still sit side by side (that much is inline); the
 * sizes, the bar and its grip are the stylesheet's.
 */
export const Split = forwardRef<HTMLElement, SplitProps>(function Split(
  { as: Tag = "div", storageKey, className, style, children, ...rest },
  ref,
) {
  const element = useRef<HTMLElement | null>(null);
  const specs = useRef<Record<string, PaneSpec>>({});
  const [sizes, setSizes] = useState<Record<string, number>>({});

  // Stored sizes arrive after the first render, so the server's markup and the first
  // client render agree.
  useEffect(() => setSizes(read(storageKey)), [storageKey]);

  const setSize = useCallback(
    (key: string, px: number | undefined) =>
      setSizes((current) => {
        const next = { ...current };
        if (px === undefined) delete next[key];
        else next[key] = Math.round(px);
        if (storageKey) {
          try {
            localStorage.setItem(storageKey, JSON.stringify(next));
          } catch {
            // Storage refused (a private window): the size holds for this visit only.
          }
        }
        return next;
      }),
    [storageKey],
  );

  const value = useMemo(
    () => ({ sizes, setSize, specs, element }),
    [sizes, setSize],
  );

  return (
    <SplitContext.Provider value={value}>
      <Tag
        ref={(node: HTMLElement | null) => {
          element.current = node;
          assign(ref, node);
        }}
        className={["clover-split", className].filter(Boolean).join(" ")}
        style={{ display: "flex", ...style }}
        {...rest}
      >
        {children}
      </Tag>
    </SplitContext.Provider>
  );
});

export type SplitPaneProps = React.HTMLAttributes<HTMLElement> & {
  as?: React.ElementType;
  /** Its width to start with. A pane without one takes the width that is left. */
  size?: SplitLength;
  /** The narrowest a handle may make it. */
  min?: SplitLength;
  /** The widest a handle may make it. */
  max?: SplitLength;
  /**
   * The name its size is remembered under (with the Split's `storageKey`). Default: its
   * place among the Split's panes.
   */
  name?: string;
};

/** One side of a `Split`. */
export const SplitPane = forwardRef<HTMLElement, SplitPaneProps>(
  function SplitPane(
    {
      as: Tag = "div",
      size,
      min,
      max,
      name,
      className,
      style,
      children,
      ...rest
    },
    ref,
  ) {
    const split = useContext(SplitContext);
    const self = useRef<HTMLElement | null>(null);
    const [key, setKey] = useState(name ?? "");

    // Its key: the given name, or its place among the panes (known once it is placed).
    useEffect(() => {
      if (name) return setKey(name);
      const panes = paneElements(split?.element.current);
      setKey(String(panes.indexOf(self.current as HTMLElement)));
    }, [name, split]);

    if (split && key) split.specs.current[key] = { min, max, size };
    const dragged = split && key ? split.sizes[key] : undefined;

    return (
      <Tag
        ref={(node: HTMLElement | null) => {
          self.current = node;
          assign(ref, node);
        }}
        className={["clover-split-pane", className].filter(Boolean).join(" ")}
        data-split-key={key || undefined}
        data-sized={size !== undefined ? "" : undefined}
        style={
          {
            minWidth: 0,
            "--clover-split-size":
              dragged !== undefined ? `${dragged}px` : cssLength(size),
            "--clover-split-min": cssLength(min),
            "--clover-split-max": cssLength(max),
            ...style,
          } as React.CSSProperties
        }
        {...rest}
      >
        {children}
      </Tag>
    );
  },
);

const paneElements = (split: HTMLElement | null | undefined) =>
  split
    ? (Array.from(split.children).filter((node) =>
        node.classList.contains("clover-split-pane"),
      ) as HTMLElement[])
    : [];

/** The panes either side of a handle, and which of them it sizes. */
function neighbours(handle: HTMLElement) {
  const sibling = (step: "previousElementSibling" | "nextElementSibling") => {
    let node = handle[step];
    while (node && !node.classList.contains("clover-split-pane")) {
      node = node[step];
    }
    return node as HTMLElement | null;
  };
  const before = sibling("previousElementSibling");
  const after = sibling("nextElementSibling");
  const sized = after?.hasAttribute("data-sized")
    ? after
    : before?.hasAttribute("data-sized")
      ? before
      : null;
  const other = sized === after ? before : after;
  return { sized, other };
}

export type SplitHandleProps = React.HTMLAttributes<HTMLDivElement>;

/**
 * The bar between two panes. Drag it, or focus it and use the arrow keys (Shift for
 * bigger steps, Home and End for the limits); a double click puts the pane back to its
 * own size. It is a focusable `separator` carrying the sized pane's share of the width.
 */
export const SplitHandle = forwardRef<HTMLDivElement, SplitHandleProps>(
  function SplitHandle(
    { className, onPointerDown, onKeyDown, onDoubleClick, ...rest },
    ref,
  ) {
    const split = useContext(SplitContext);
    const { t } = useCloverTranslation();
    const self = useRef<HTMLDivElement | null>(null);
    const [value, setValue] = useState<{
      now: number;
      min: number;
      max: number;
    }>();

    /** The sized pane's limits, in pixels, given the room the split has. */
    const limits = useCallback(() => {
      const handle = self.current;
      const container = split?.element.current;
      if (!handle || !container || !split) return null;
      const { sized, other } = neighbours(handle);
      if (!sized) return null;
      const across = container.clientWidth;
      const key = sized.dataset.splitKey ?? "";
      const spec = split.specs.current[key] ?? {};
      const otherSpec =
        split.specs.current[other?.dataset.splitKey ?? ""] ?? {};
      const min = toPixels(spec.min, across) ?? 0;
      const room =
        across - handle.offsetWidth - (toPixels(otherSpec.min, across) ?? 0);
      const max = Math.max(
        min,
        Math.min(toPixels(spec.max, across) ?? room, room),
      );
      // Whether the sized pane is after the bar (to its right, or its left in RTL).
      const after =
        sized.getBoundingClientRect().left >=
        handle.getBoundingClientRect().left - 1;
      return { sized, key, min, max, after };
    }, [split]);

    const resize = useCallback(
      (px: number) => {
        const found = limits();
        if (!found || !split) return;
        const clamped = Math.min(found.max, Math.max(found.min, px));
        split.setSize(found.key, clamped);
        setValue({ now: clamped, min: found.min, max: found.max });
      },
      [limits, split],
    );

    // The separator's value, for assistive technology: refreshed as the split resizes.
    const update = useCallback(() => {
      const found = limits();
      if (found)
        setValue({
          now: found.sized.getBoundingClientRect().width,
          min: found.min,
          max: found.max,
        });
    }, [limits]);
    useEffect(() => {
      const container = split?.element.current;
      update();
      if (!container || typeof ResizeObserver === "undefined") return;
      const observer = new ResizeObserver(update);
      observer.observe(container);
      return () => observer.disconnect();
    }, [update, split, split?.sizes]);

    const percent = (px: number) =>
      Math.round((px / (split?.element.current?.clientWidth || 1)) * 100);
    const dragging = useRef<ReturnType<typeof limits>>(null);

    return (
      <div
        ref={(node) => {
          self.current = node;
          assign(ref, node);
        }}
        role="separator"
        aria-orientation="vertical"
        aria-label={rest["aria-label"] ?? t("splitHandle")}
        aria-valuenow={value ? percent(value.now) : undefined}
        aria-valuemin={value ? percent(value.min) : undefined}
        aria-valuemax={value ? percent(value.max) : undefined}
        tabIndex={0}
        className={["clover-split-handle", className].filter(Boolean).join(" ")}
        onPointerDown={(event) => {
          onPointerDown?.(event);
          if (event.defaultPrevented || event.button !== 0) return;
          dragging.current = limits();
          if (!dragging.current) return;
          event.preventDefault();
          event.currentTarget.setPointerCapture?.(event.pointerId);
          event.currentTarget.dataset.dragging = "";
        }}
        onPointerMove={(event) => {
          const found = dragging.current;
          if (!found) return;
          // The sized pane's far edge stays put; the bar is its near edge.
          const box = found.sized.getBoundingClientRect();
          resize(
            found.after ? box.right - event.clientX : event.clientX - box.left,
          );
        }}
        onPointerUp={(event) => {
          dragging.current = null;
          delete event.currentTarget.dataset.dragging;
        }}
        onPointerCancel={(event) => {
          dragging.current = null;
          delete event.currentTarget.dataset.dragging;
        }}
        onKeyDown={(event) => {
          onKeyDown?.(event);
          if (event.defaultPrevented) return;
          const found = limits();
          if (!found) return;
          const now = found.sized.getBoundingClientRect().width;
          const step = KEY_STEP_REM * rootFontSize() * (event.shiftKey ? 4 : 1);
          // Toward the sized pane shrinks it: which arrow that is depends on its side.
          const grow = found.after ? "ArrowLeft" : "ArrowRight";
          const shrink = found.after ? "ArrowRight" : "ArrowLeft";
          if (event.key === grow) resize(now + step);
          else if (event.key === shrink) resize(now - step);
          else if (event.key === "Home") resize(found.min);
          else if (event.key === "End") resize(found.max);
          else return;
          event.preventDefault();
        }}
        onDoubleClick={(event) => {
          onDoubleClick?.(event);
          const found = limits();
          if (!found) return;
          split?.setSize(found.key, undefined);
          // Its own size again: read once the pane has it.
          requestAnimationFrame(update);
        }}
        {...rest}
      />
    );
  },
);
