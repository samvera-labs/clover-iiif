import { useCallback, useEffect, useState } from "react";

import { useTranslation } from "react-i18next";

export const useCopyToClipboard = (
  text: string,
  notifyTimeout = 2500,
): [string, () => void] => {
  const { t } = useTranslation();

  const [copyStatus, setCopyStatus] = useState("");
  const copy = useCallback(() => {
    navigator.clipboard.writeText(text).then(
      () => setCopyStatus(t("copySuccess")),
      () => setCopyStatus(t("copyFailure")),
    );
  }, [text]);

  useEffect(() => {
    if (!copyStatus) return;

    const timeoutId = setTimeout(
      () => setCopyStatus(""),
      notifyTimeout,
    );

    return () => clearTimeout(timeoutId);
  }, [copyStatus]);

  return [copyStatus, copy];
};
