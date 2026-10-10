import React from "react";

import { useCloverTranslation } from "../../i18n/useCloverTranslation";
import { join } from "../../lib/classnames";
import { useStatus } from "../../react/hooks";

export interface StatusProps {
  className?: string;
  /** Shown while loading. Default: a translated "Loading…". */
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
    return (
      <p
        className={join("clover-status", className)}
        data-status={status}
        role="status"
      >
        {loading ?? t("statusLoading")}
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
