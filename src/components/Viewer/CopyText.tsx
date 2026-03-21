import React from "react";
import { useCopyToClipboard } from "src/hooks/useCopyToClipboard";
import { copyStatus } from "./CopyText.css";

const CopyTextStatus: React.FC<{ status?: string }> = ({ status }) => {
  if (!status) return null;

  return (
    <span className={copyStatus} data-copy-status={status}>
      {status}
    </span>
  );
};

export const CopyText: React.FC<{ textPrompt: string; textToCopy: string }> = ({
  textPrompt,
  textToCopy,
}) => {
  const [copyStatus, copyText] = useCopyToClipboard(textToCopy);
  return (
    <button onClick={copyText}>
      {textPrompt} <CopyTextStatus status={copyStatus} />
    </button>
  );
};

export default CopyText;
