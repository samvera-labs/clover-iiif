import { ErrorBoundary } from "react-error-boundary";
import ErrorFallback from "src/components/UI/ErrorFallback/ErrorFallback";
import React from "react";
import ShareContentState from "./ContentState";

interface CloverShareProps {}

const CloverShare: React.FC<CloverShareProps> = ({ contentState }) => {
  return (
    <ErrorBoundary FallbackComponent={ErrorFallback}>
      {contentState && <ShareContentState contentState={contentState} />}
    </ErrorBoundary>
  );
};

export default CloverShare;
