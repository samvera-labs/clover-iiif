import { Icon } from "src/components/UI/Icon/Icon";
import { Popover } from "src/components/UI";
import React from "react";
import { RenderingItem } from "src/types/presentation-3";
import useViewerDownload from "src/hooks/useViewerDownload";

const ViewerDownload = () => {
  const { allPages, hasDownload, individualPages } = useViewerDownload();

  const handleDownloadClick = (id: RenderingItem["id"]) => {
    window.open(id, "_blank");
  };

  if (!hasDownload) {
    return null;
  }

  return (
    <Popover>
      <Popover.Trigger
        className="clover-viewer-download-trigger"
        data-testid="download-button"
      >
        <Icon>
          <Icon.Download />
        </Icon>
      </Popover.Trigger>
      <Popover.Content
        className="clover-viewer-popover-content clover-viewer-download-content"
        data-testid="download-content"
      >
        {individualPages.length > 0 && (
          <>
            <h3>Individual Pages</h3>
            <ul>
              {individualPages.map(({ format, id, label }) => (
                <li key={label}>
                  <button onClick={() => handleDownloadClick(id)}>
                    {label} ({format})
                  </button>
                </li>
              ))}
            </ul>
          </>
        )}

        {allPages.length > 0 && (
          <>
            <h3>All Pages</h3>
            <ul>
              {allPages.map(({ format, id, label }) => (
                <li key={label}>
                  <button onClick={() => handleDownloadClick(id)}>
                    {label} ({format})
                  </button>
                </li>
              ))}
            </ul>
          </>
        )}
      </Popover.Content>
    </Popover>
  );
};

export default ViewerDownload;
