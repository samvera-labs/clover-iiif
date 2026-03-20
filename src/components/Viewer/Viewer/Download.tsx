import { Icon } from "src/components/UI/Icon/Icon";
import { Popover } from "src/components/UI";
import React from "react";
import { RenderingItem } from "src/types/presentation-3";
import useViewerDownload from "src/hooks/useViewerDownload";
import { downloadButton, downloadContent } from "./Download.css";

const ViewerDownload = () => {
  const { allPages, individualPages } = useViewerDownload();
  const showDownloadButton = allPages.length > 0 || individualPages.length > 0;

  const handleDownloadClick = (id: RenderingItem["id"]) => {
    window.open(id, "_blank");
  };

  if (!showDownloadButton) {
    return null;
  }

  return (
    <Popover>
      <Popover.Trigger className={downloadButton} data-testid="download-button">
        <Icon>
          <Icon.Download />
        </Icon>
      </Popover.Trigger>
      <Popover.Content className={downloadContent} data-testid="download-content">
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
