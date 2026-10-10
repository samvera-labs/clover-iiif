import React, { useId, useRef } from "react";

/**
 * Tabs, as the WAI-ARIA pattern has them: a `tablist` of `tab` buttons, one tab stop, the
 * arrow keys (and Home/End) moving and selecting, and one `tabpanel` per tab. Only the
 * selected panel is rendered; the rest are `hidden` placeholders, so a panel's content
 * mounts when first shown.
 */
export interface TabSpec {
  value: string;
  label: React.ReactNode;
  content: React.ReactNode;
}

export interface TabsProps {
  tabs: TabSpec[];
  value: string;
  onValueChange: (value: string) => void;
  /** The tab list's accessible name. */
  label: string;
  className?: string;
}

export function Tabs({
  tabs,
  value,
  onValueChange,
  label,
  className,
}: TabsProps) {
  const id = useId();
  const buttons = useRef<Array<HTMLButtonElement | null>>([]);
  const selected = Math.max(
    0,
    tabs.findIndex((tab) => tab.value === value),
  );

  const onKeyDown = (event: React.KeyboardEvent, index: number) => {
    const last = tabs.length - 1;
    const next =
      event.key === "ArrowRight"
        ? (index + 1) % tabs.length
        : event.key === "ArrowLeft"
          ? (index - 1 + tabs.length) % tabs.length
          : event.key === "Home"
            ? 0
            : event.key === "End"
              ? last
              : null;
    if (next === null) return;
    event.preventDefault();
    onValueChange(tabs[next].value);
    buttons.current[next]?.focus();
  };

  return (
    <div className={className}>
      <div role="tablist" aria-label={label} className="clover-tabs-list">
        {tabs.map((tab, index) => (
          <button
            key={tab.value}
            ref={(element) => {
              buttons.current[index] = element;
            }}
            type="button"
            role="tab"
            id={`${id}-tab-${index}`}
            aria-selected={index === selected}
            aria-controls={`${id}-panel-${index}`}
            tabIndex={index === selected ? 0 : -1}
            className="clover-tabs-tab"
            data-value={tab.value}
            onClick={() => onValueChange(tab.value)}
            onKeyDown={(event) => onKeyDown(event, index)}
          >
            {tab.label}
          </button>
        ))}
      </div>
      {tabs.map((tab, index) => (
        <div
          key={tab.value}
          role="tabpanel"
          id={`${id}-panel-${index}`}
          aria-labelledby={`${id}-tab-${index}`}
          tabIndex={0}
          hidden={index !== selected}
          className="clover-tabs-panel"
          data-value={tab.value}
        >
          {index === selected ? tab.content : null}
        </div>
      ))}
    </div>
  );
}
