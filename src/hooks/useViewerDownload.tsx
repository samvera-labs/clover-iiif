import type { Vault } from "@iiif/helpers/vault";
import { RenderingItem } from "src/types/presentation-3";
import { getLabelAsString } from "src/lib/label-helpers";
import getVaultEntityId from "src/hooks/getVaultEntityId";
import { useViewerState } from "src/context/viewer-context";
import useRendering from "src/hooks/use-iiif/useRendering";

type DownloadItem = {
  format?: string;
  id?: string;
  label: string;
};

function prepareDownloadLinks(
  items: RenderingItem[],
  defaultLabel: string,
  vault: Vault,
): DownloadItem[] {
  return items.map(({ format, id, label }) => {
    const resourceId = getVaultEntityId(vault, id);
    return {
      format,
      id: resourceId,
      label: getLabelAsString(label) || defaultLabel,
    };
  });
}

export default function useViewerDownload() {
  const rendering = useRendering();
  const { vault } = useViewerState();

  const allPages = prepareDownloadLinks(
    rendering?.root || [],
    "Root Rendering Label",
    vault,
  );

  const individualPages = prepareDownloadLinks(
    rendering?.canvas || [],
    "Canvas Rendering Label",
    vault,
  );

  return {
    allPages,
    individualPages,
  };
}
