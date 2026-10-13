import React, { useEffect, useRef } from "react";

interface ControlMenuProps {
  id: string;
  /** The control that opens the menu, which toggles it itself. */
  triggerId: string;
  /** Close, returning focus to the control that opened it when `restoreFocus`. */
  onClose: (restoreFocus: boolean) => void;
  "data-testid"?: string;
  children: React.ReactNode;
}

/**
 * The menu a control opens — Choice, annotations — hanging below the cluster; an
 * animation's frames open the same menu up from their bar.
 *
 * Its items are native radios in fieldsets, so a reader moves between them with the
 * arrow keys and hears the group's name and the current item. Opening focuses the checked
 * item (else the first), scrolled into the menu's view. It closes on Escape, returning
 * focus to the control, and on a press outside.
 */
const ControlMenu: React.FC<ControlMenuProps> = ({
  id,
  triggerId,
  onClose,
  "data-testid": testId,
  children,
}) => {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const menu = ref.current;
    const item =
      menu?.querySelector<HTMLInputElement>("input:checked") ??
      menu?.querySelector<HTMLInputElement>("input");
    // Its whole row in sight within the menu (a long one scrolls), never the page.
    const row = item?.closest("label");
    if (menu && row) {
      const bottom = row.offsetTop + row.offsetHeight;
      if (bottom > menu.scrollTop + menu.clientHeight) {
        menu.scrollTop = bottom - menu.clientHeight;
      }
      if (row.offsetTop < menu.scrollTop) menu.scrollTop = row.offsetTop;
    }
    item?.focus({ preventScroll: true });

    const onPointerDown = (event: PointerEvent) => {
      const target = event.target as Element | null;
      if (ref.current?.contains(target)) return;
      // The control that opens the menu toggles it itself.
      if (document.getElementById(triggerId)?.contains(target)) return;
      onClose(false);
    };
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose(true);
    };
    document.addEventListener("pointerdown", onPointerDown);
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("pointerdown", onPointerDown);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [triggerId, onClose]);

  return (
    <div className="clover-canvas-menu" data-testid={testId} id={id} ref={ref}>
      {children}
    </div>
  );
};

export default ControlMenu;
