import React from "react";
import { styled } from "stitches";
import { useCopyToClipboard, CopyStatus } from "hooks/useCopyToClipboard";

const Status = styled("span", {
  display: "flex",
  alignContent: "center",
  alignItems: "center",
  padding: "0.125rem 0.25rem 0",
  marginTop: "-0.125rem",
  marginLeft: "0.5rem",
  backgroundColor: "$accent",
  color: "$secondary",
  borderRadius: "3px",
  fontSize: "0.6111rem",
  textTransform: "uppercase",
  lineHeight: "1em",
});

const CopyTextStatus: React.FC<{ status: CopyStatus }> = ({ status }) => {
  if (!status) return null;

  return <Status data-copy-status={status}>{status}</Status>;
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
