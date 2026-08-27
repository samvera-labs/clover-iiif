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
    /*
     * Whether the resource offers anything to download at all.
     *
     * Returned from here so the rule lives in one place. The header needs to know before it
     * draws the options bar — `showDownload` only says the consumer wants the button, not
     * that the Manifest or Canvas has any `rendering` to hang off it, and a bar built on the
     * option alone was left holding an invisible box.
     */
    hasDownload: allPages.length > 0 || individualPages.length > 0,
  };
}
