import { RenderingItem } from "src/types/presentation-3";
import { getLabelAsString } from "src/lib/label-helpers";
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
  return items.map(({ format, id, label }) => ({
    format,
    id,
    label: getLabelAsString(label) || defaultLabel,
  }));
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
