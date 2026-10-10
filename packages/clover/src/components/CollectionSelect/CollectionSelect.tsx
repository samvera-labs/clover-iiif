import React, { forwardRef, useEffect, useId, useState } from "react";

import { itemsOfCollection } from "../../core/items";
import { localize } from "../../core/value";
import { useCloverTranslation } from "../../i18n/useCloverTranslation";
import { join } from "../../lib/classnames";
import { useClover, useCloverSelector } from "../../react/context";

export interface CollectionSelectProps
  extends Omit<React.HTMLAttributes<HTMLElement>, "onChange"> {
  /** Called with the member chosen, before Clover moves there. */
  onChange?: (id: string) => void;
}

/**
 * A native `<select>` of the Collection's members, labelled by the Collection: choosing a
 * Manifest shows it, choosing a nested Collection enters it. Renders nothing outside a
 * Collection, or for a Collection of one.
 */
export const CollectionSelect = forwardRef<HTMLElement, CollectionSelectProps>(
  function CollectionSelect({ onChange, className, ...rest }, ref) {
    const { t } = useCloverTranslation();
    const { clover, language } = useClover("CollectionSelect");
    const collection = useCloverSelector((state) => state.collection);
    const shown = useCloverSelector((state) => state.manifest?.id ?? "");
    const id = useId();
    // The choice holds while its Manifest loads, rather than snapping back.
    const [pending, setPending] = useState<string | null>(null);
    useEffect(() => setPending(null), [shown, collection]);

    const items = itemsOfCollection(collection);
    if (items.length < 2) return null;
    const label = localize(collection?.label as never, language);

    return (
      <div
        ref={ref as React.Ref<HTMLDivElement>}
        className={join("clover-collection-select", className)}
        {...rest}
      >
        {label.text && (
          <label
            htmlFor={`${id}-select`}
            className="clover-collection-select-label"
            lang={label.lang}
          >
            {label.text}
          </label>
        )}
        <select
          id={`${id}-select`}
          className="clover-collection-select-control"
          value={pending ?? shown}
          aria-label={label.text ? undefined : t("collectionLabel")}
          onChange={(event) => {
            const next = event.target.value;
            setPending(next);
            onChange?.(next);
            void clover.goToManifest(next);
          }}
        >
          {items.map((item) => {
            const text = localize(item.label, language);
            return (
              <option key={item.id} value={item.id} lang={text.lang}>
                {text.text || item.id}
              </option>
            );
          })}
        </select>
      </div>
    );
  },
);
