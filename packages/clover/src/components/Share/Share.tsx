import React, { useRef, useState } from "react";

import type { ContentStateOutput } from "../../core/content-state";
import { useCloverTranslation } from "../../i18n/useCloverTranslation";
import { join } from "../../lib/classnames";
import { useClover } from "../../react/context";

export interface ShareProps
  extends Omit<React.ButtonHTMLAttributes<HTMLButtonElement>, "type"> {
  /** The page the link opens. Default: this page. */
  baseUrl?: string;
  /** The query parameter carrying the content state. Default `iiif-content`. */
  param?: string;
  /**
   * Called with the link and the content state before it is copied. Return `false` to
   * share it yourself instead (a dialog of your own, say).
   */
  onShare?: (url: string, state: ContentStateOutput) => boolean | void;
}

/** A link to the page that opens it where the reader is now. */
export function shareUrl(
  state: ContentStateOutput,
  baseUrl?: string,
  param = "iiif-content",
): string {
  const base =
    baseUrl ??
    (typeof location !== "undefined" ? location.href : "http://localhost/");
  const url = new URL(base);
  url.searchParams.set(param, state.encoded);
  return url.toString();
}

/**
 * A button that copies a link to where the reader is: the Canvas, and the region in view
 * (or the moment in a video). The link carries a IIIF content state in `iiif-content`,
 * which a `Root` given that value opens at the same place.
 *
 * Where the clipboard is refused, the link is shown in a field, selected, to copy by
 * hand.
 */
export function Share({
  baseUrl,
  param,
  onShare,
  className,
  children,
  ...rest
}: ShareProps) {
  const { t } = useCloverTranslation();
  const { clover } = useClover("Share");
  const [status, setStatus] = useState<"idle" | "copied" | "failed">("idle");
  const [link, setLink] = useState<string | null>(null);
  const field = useRef<HTMLInputElement>(null);

  const share = async () => {
    const state = clover.getContentState();
    if (!state) return;
    const url = shareUrl(state, baseUrl, param);
    if (onShare?.(url, state) === false) return;
    try {
      await navigator.clipboard.writeText(url);
      setLink(null);
      setStatus("copied");
    } catch {
      setLink(url);
      setStatus("failed");
      requestAnimationFrame(() => field.current?.select());
    }
  };

  return (
    <span className={join("clover-share", className)} data-status={status}>
      <button
        type="button"
        className="clover-share-button"
        onClick={share}
        {...rest}
      >
        {children ?? t("commonShare")}
      </button>
      <span role="status" className="clover-share-status">
        {status === "copied" ? t("copySuccess") : ""}
      </span>
      {link && (
        <input
          ref={field}
          className="clover-share-link"
          readOnly
          value={link}
          aria-label={t("commonShare")}
          onFocus={(event) => event.target.select()}
        />
      )}
    </span>
  );
}
