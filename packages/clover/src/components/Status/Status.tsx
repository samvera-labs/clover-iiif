import React from "react";

import { useCloverTranslation } from "../../i18n/useCloverTranslation";
import { join } from "../../lib/classnames";
import { useStatus } from "../../react/hooks";
import { Loading } from "../../ui/Loading";
import { visuallyHidden } from "../../ui/visuallyHidden";

export interface StatusProps {
  className?: string;
  /**
   * Shown while loading. Default: Clover's loading mark (three pulsing dots), announced
   * as a translated "Loading…". `false` shows nothing and only announces it, for a
   * layout whose stage shows its own loading (`Content` does), so nothing moves.
   */
  loading?: React.ReactNode;
  /** Shown when loading failed. Default: a translated message and the error's own. */
  error?: (error: Error) => React.ReactNode;
}

/**
 * Loading and error states, announced: `role="status"` while loading and `role="alert"`
 * on failure. Renders nothing once the content is ready.
 */
export function Status({
  className,
  loading,
  error: renderError,
}: StatusProps) {
  const { t } = useCloverTranslation();
  const { status, error } = useStatus();

  if (status === "loading") {
    // Your own words are announced as they are; Clover's mark, or none, by the label.
    const own = loading !== undefined && loading !== false;
    return (
      <p
        className={join("clover-status", className)}
        data-status={status}
        role="status"
        style={loading === false ? visuallyHidden : undefined}
      >
        {own ? loading : loading === undefined && <Loading />}
        {!own && <span style={visuallyHidden}>{t("statusLoading")}</span>}
      </p>
    );
  }
  if (status === "error" && error) {
    return (
      <div
        className={join("clover-status", className)}
        data-status={status}
        role="alert"
      >
        {renderError ? (
          renderError(error)
        ) : (
          <>
            <p>{t("statusError")}</p>
            <p className="clover-status-detail">{error.message}</p>
          </>
        )}
      </div>
    );
  }
  return null;
}
