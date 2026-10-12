import React, { useEffect } from "react";

import { useCloverTranslation } from "../i18n/useCloverTranslation";

/**
 * A key a control answers to: as `aria-keyshortcuts` names it (WAI-ARIA key names, `Plus`
 * and `Space` spelled out, alternatives space-separated), and as its popover shows it.
 */
export interface Shortcut {
  keys: string;
  glyph: string;
}

/**
 * The keys the Canvas answers to, by control. A Canvas takes them while it, or any of its
 * own controls, has focus (`forwardShortcut`). Name a key here only once the
 * Canvas handles it: a popover that names a key that does nothing misleads.
 */
export const SHORTCUTS = {
  zoomIn: { keys: "Plus", glyph: "+" },
  zoomOut: { keys: "-", glyph: "−" },
  reset: { keys: "0", glyph: "0" },
  rotateRight: { keys: "R", glyph: "R" },
  rotateLeft: { keys: "Shift+R", glyph: "⇧R" },
  play: { keys: "K Space", glyph: "K" },
  mute: { keys: "M", glyph: "M" },
} satisfies Record<string, Shortcut>;

/** The characters those shortcuts are typed with, as `KeyboardEvent.key` reports them. */
export const SHORTCUT_KEYS = new Set([
  "+",
  "=",
  "-",
  "_",
  "0",
  "r",
  "R",
  "k",
  "K",
  "m",
  "M",
  "j",
  "J",
  "l",
  "L",
]);

/**
 * The popover a control shows on hover and on keyboard focus: its name, the same string
 * its `aria-label` gives assistive technology (WCAG 2.5.3, Label in Name), and its key
 * when it has one. Put it inside the control, last; the control carries the name and
 * `aria-keyshortcuts`, so the popover itself is hidden from assistive technology.
 *
 * WCAG 1.4.13 (Content on Hover or Focus): it shows on focus as well as hover; Escape
 * hides it without moving the pointer or focus; the pointer can move onto it without it
 * closing; and it stays until the pointer or focus leaves. Styles are `ui/Tip.css`.
 */
export function Tip({
  label,
  shortcut,
}: {
  label: string;
  shortcut?: Shortcut;
}) {
  const { t } = useCloverTranslation();
  useEscapeHidesTips();
  return (
    <span className="clover-tip" aria-hidden="true">
      {shortcut
        ? t("controlShortcut", { label, shortcut: shortcut.glyph })
        : label}
    </span>
  );
}

/*
 * Escape hides the popover of whatever is hovered or focused, until the pointer leaves it
 * or it loses focus. One listener per document, however many popovers there are.
 */
let listening = 0;

function hideTips(event: KeyboardEvent) {
  if (event.key !== "Escape") return;
  const shown = new Set<HTMLElement>();
  document
    .querySelectorAll<HTMLElement>(":hover > .clover-tip")
    .forEach((tip) => tip.parentElement && shown.add(tip.parentElement));
  const focused = document.activeElement as HTMLElement | null;
  const hasTip = (element: Element) =>
    Array.from(element.children).some((child) =>
      child.classList.contains("clover-tip"),
    );
  if (focused && hasTip(focused)) shown.add(focused);
  shown.forEach((control) => {
    control.dataset.tipHidden = "";
    const show = () => {
      delete control.dataset.tipHidden;
      control.removeEventListener("pointerleave", show);
      control.removeEventListener("blur", show);
    };
    control.addEventListener("pointerleave", show);
    control.addEventListener("blur", show);
  });
}

function useEscapeHidesTips() {
  useEffect(() => {
    if (listening++ === 0) document.addEventListener("keydown", hideTips, true);
    return () => {
      if (--listening === 0)
        document.removeEventListener("keydown", hideTips, true);
    };
  }, []);
}

/**
 * A Canvas's shortcuts, taken from its own controls too: the keydown is sent on to the
 * viewport, which handles them. A key a focused control uses itself (Space, Enter, the
 * arrows) and anything typed into a field is left alone.
 */
export function forwardShortcut(
  event: React.KeyboardEvent,
  viewport: HTMLElement | null,
) {
  const target = event.target as HTMLElement;
  if (!viewport || target === viewport || viewport.contains(target)) return;
  if (!SHORTCUT_KEYS.has(event.key)) return;
  if (event.altKey || event.metaKey || event.ctrlKey) return;
  if (target.closest("input, select, textarea, [contenteditable]")) return;
  event.preventDefault();
  viewport.dispatchEvent(
    new KeyboardEvent("keydown", {
      key: event.key,
      shiftKey: event.shiftKey,
      bubbles: true,
      cancelable: true,
    }),
  );
}
