import React, { useId, useRef, useState } from "react";

/** One section: what its button says, and what its panel shows. */
export interface SectionSpec {
  value: string;
  label: React.ReactNode;
  content: React.ReactNode;
}

/** How the sections are laid out. */
export type SectionsLayout = "tabs" | "accordion";

export interface SectionsProps {
  items: SectionSpec[];
  layout?: SectionsLayout;
  /** The section open, controlled. With `accordion`, `null` closes them all. */
  value?: string | null;
  /** The section open to start with. Default: the first. */
  defaultValue?: string;
  /** Called with a section as it opens. */
  onValueChange?: (value: string) => void;
  /** The tab list's accessible name (`tabs`). */
  label?: string;
  /** The heading level each button sits in (`accordion`). Default 3. */
  headingLevel?: 2 | 3 | 4 | 5 | 6;
  className?: string;
}

/**
 * Sections, laid out as tabs or as an accordion from the same parts: a button and a panel
 * each, the same state (the one section open), and the same mounting (a panel's content
 * mounts when it first opens, and stays). The layouts differ only where the patterns do:
 *
 * - `tabs`: the buttons gather in a `tablist` as `tab`s; one is always open, and the
 *   arrow keys (Home, End) move and select, with one tab stop (WAI-ARIA tabs).
 * - `accordion`: each button sits in a heading above its panel, `aria-expanded`; opening
 *   one closes the others, and pressing the open one closes it. The arrow keys move
 *   between headings without opening them, and each button is its own tab stop
 *   (WAI-ARIA accordion).
 *
 * So switching layout keeps what is open, and the stylesheet keys on `data-layout`.
 */
export function Sections({
  items,
  layout = "tabs",
  value,
  defaultValue,
  onValueChange,
  label,
  headingLevel = 3,
  className,
}: SectionsProps) {
  const id = useId();
  const buttons = useRef<Array<HTMLButtonElement | null>>([]);
  const [own, setOwn] = useState<string | null>(
    defaultValue ?? items[0]?.value ?? null,
  );
  const tabs = layout === "tabs";

  // Open: the controlled value, or the reader's. A tab is always open; a box may not be.
  const chosen = value !== undefined ? value : own;
  const open = items.some((item) => item.value === chosen)
    ? chosen
    : tabs
      ? (items[0]?.value ?? null)
      : null;
  // Every section opened so far: its content stays mounted once it has been shown.
  const mounted = useRef(new Set<string>());
  if (open) mounted.current.add(open);

  const choose = (item: string) => {
    // Pressing the open box closes it; pressing the open tab keeps it.
    const next = !tabs && item === open ? null : item;
    if (value === undefined) setOwn(next);
    if (next) onValueChange?.(next);
  };

  const onKeyDown = (event: React.KeyboardEvent, index: number) => {
    const last = items.length - 1;
    const [back, forward] = tabs
      ? ["ArrowLeft", "ArrowRight"]
      : ["ArrowUp", "ArrowDown"];
    const next =
      event.key === forward
        ? (index + 1) % items.length
        : event.key === back
          ? (index - 1 + items.length) % items.length
          : event.key === "Home"
            ? 0
            : event.key === "End"
              ? last
              : null;
    if (next === null) return;
    event.preventDefault();
    buttons.current[next]?.focus();
    // A tab is chosen as it is reached; a heading waits for Enter or Space.
    if (tabs) choose(items[next].value);
  };

  const Heading = `h${headingLevel}` as "h3";
  const button = (item: SectionSpec, index: number) => {
    const isOpen = item.value === open;
    return (
      <button
        key={item.value}
        ref={(element) => {
          buttons.current[index] = element;
        }}
        type="button"
        id={`${id}-button-${index}`}
        className="clover-sections-button"
        data-value={item.value}
        aria-controls={`${id}-panel-${index}`}
        {...(tabs
          ? {
              role: "tab",
              "aria-selected": isOpen,
              tabIndex: isOpen ? 0 : -1,
            }
          : { "aria-expanded": isOpen })}
        onClick={() => choose(item.value)}
        onKeyDown={(event) => onKeyDown(event, index)}
      >
        <span className="clover-sections-label">{item.label}</span>
        {/* A heading's open and closed state, drawn; a tab's is its underline. */}
        {!tabs && (
          <svg
            aria-hidden="true"
            focusable="false"
            width="12"
            height="12"
            viewBox="0 0 12 12"
            className="clover-sections-chevron"
          >
            <path
              d="M3 4.5l3 3 3-3"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        )}
      </button>
    );
  };

  return (
    <div
      className={["clover-sections", className].filter(Boolean).join(" ")}
      data-layout={layout}
    >
      {tabs && (
        <div role="tablist" aria-label={label} className="clover-sections-list">
          {items.map(button)}
        </div>
      )}
      {items.map((item, index) => {
        const isOpen = item.value === open;
        return (
          <section
            key={item.value}
            className="clover-sections-item"
            data-value={item.value}
            data-open={isOpen}
          >
            {!tabs && (
              <Heading className="clover-sections-heading">
                {button(item, index)}
              </Heading>
            )}
            <div
              id={`${id}-panel-${index}`}
              role={tabs ? "tabpanel" : "region"}
              aria-labelledby={`${id}-button-${index}`}
              // A tab panel is a tab stop of its own; a region is reached by its content.
              tabIndex={tabs ? 0 : undefined}
              className="clover-sections-panel"
              hidden={!isOpen}
            >
              {mounted.current.has(item.value) ? item.content : null}
            </div>
          </section>
        );
      })}
    </div>
  );
}
