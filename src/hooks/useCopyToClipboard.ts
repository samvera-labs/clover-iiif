import { useCallback, useEffect, useState } from "react";

import { useCloverTranslation } from "src/i18n/useCloverTranslation";

export const useCopyToClipboard = (
  text: string,
  notifyTimeout = 2500,
): [string, () => void] => {
  const { t } = useCloverTranslation();

  const [copyStatus, setCopyStatus] = useState("");
  const copy = useCallback(() => {
    navigator.clipboard.writeText(text).then(
      () => setCopyStatus(t("copySuccess")),
      () => setCopyStatus(t("copyFailure")),
    );
  }, [t, text]);

  useEffect(() => {
    if (!copyStatus) return;

    const timeoutId = setTimeout(() => setCopyStatus(""), notifyTimeout);

    return () => clearTimeout(timeoutId);
  }, [copyStatus, notifyTimeout]);

  return [copyStatus, copy];
};
