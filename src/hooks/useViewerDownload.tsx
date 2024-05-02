import { RenderingItem } from "src/types/presentation-3";
import { getLabelAsString } from "src/lib/label-helpers";
import useGetVaultEntityId from "src/hooks/useGetVaultEntityId";
import useRendering from "src/hooks/use-iiif/useRendering";

type DownloadItem = {
  format?: string;
  id?: string;
  label: string;
};

function prepareDownloadLinks(
  items: RenderingItem[],
  defaultLabel: string,
): DownloadItem[] {
  return items.map(({ format, id, label }) => {
    const resourceId = useGetVaultEntityId(id);
    return {
      format,
      id: resourceId,
      label: getLabelAsString(label) || defaultLabel,
    };
  });
}

export default function useViewerDownload() {
  const rendering = useRendering();

  const allPages = prepareDownloadLinks(
    rendering?.root || [],
    "Root Rendering Label",
  );

  const individualPages = prepareDownloadLinks(
    rendering?.canvas || [],
    "Canvas Rendering Label",
  );

  return {
    allPages,
    individualPages,
  };
}
