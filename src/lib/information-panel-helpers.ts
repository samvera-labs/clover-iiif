import type { AnnotationResources, AnnotationResource } from "src/types/annotations";
import type { PluginConfig } from "src/context/viewer-context";
import type { AnnotationCollectionNormalized } from "src/types/annotation-collection";
import type { AnnotationNormalized } from "@iiif/presentation-3";

export interface PanelVisibilityInput {
  informationPanel?: {
    renderAbout?: boolean;
    renderAnnotation?: boolean;
    renderContentSearch?: boolean;
    defaultTab?: string;
  };
  annotationResources?: AnnotationResources;
  filteredAnnotationResources?: AnnotationResources;
  contentSearchResource?: AnnotationResource;
  pluginsWithInfoPanel?: PluginConfig[];
  contentStateAnnotation?: AnnotationNormalized | null;
  annotationCollection?: AnnotationCollectionNormalized | null;
  activeCanvas?: string;
}

/**
 * Extract the target resource from a IIIF content state annotation.
 * Handles both SpecificResource (with .source) and direct target shapes.
 */
function getContentStateTarget(
  annotation: AnnotationNormalized | null | undefined,
): { id: string } | undefined {
  if (!annotation) return undefined;
  // IIIF content state target shape varies: may be a SpecificResource with a
  // `source` property, or a direct reference with an `id`.
  const target =
    (annotation as Record<string, unknown>).target as
      | { source?: { id: string }; id?: string }
      | undefined;
  return target?.source ?? (target?.id ? target : undefined);
}

export function annotationTargetsCanvas(
  annotation: AnnotationNormalized | null | undefined,
  activeCanvas: string,
): boolean {
  const target = getContentStateTarget(annotation);
  return Boolean(target) && target.id === activeCanvas;
}

function hasAnnotationContent(input: PanelVisibilityInput): boolean {
  const {
    annotationResources,
    filteredAnnotationResources,
    contentStateAnnotation,
    annotationCollection,
    activeCanvas,
  } = input;

  // Use filtered resources when available (respects motivation filtering);
  // fall back to unfiltered for callers that don't filter (e.g., Content.tsx).
  const resources = filteredAnnotationResources ?? annotationResources;
  const hasFilteredResources = (resources?.length ?? 0) > 0;

  const hasCanvasScopedContentState = activeCanvas
    ? annotationTargetsCanvas(contentStateAnnotation, activeCanvas)
    : Boolean(contentStateAnnotation);

  const hasCollectionPages = (annotationCollection?.pages?.length ?? 0) > 0;

  return hasFilteredResources || hasCanvasScopedContentState || hasCollectionPages;
}

export function hasAnyPanel(input: PanelVisibilityInput): boolean {
  const { informationPanel, contentSearchResource, pluginsWithInfoPanel } = input;

  if (informationPanel?.renderAbout) return true;
  if (informationPanel?.renderAnnotation && hasAnnotationContent(input)) return true;
  if (informationPanel?.renderContentSearch && contentSearchResource) return true;
  if (pluginsWithInfoPanel && pluginsWithInfoPanel.length > 0) return true;

  return false;
}

export function getAvailableTabs(input: PanelVisibilityInput): string[] {
  const {
    informationPanel,
    contentSearchResource,
    pluginsWithInfoPanel,
  } = input;

  const tabs = [
    informationPanel?.renderAbout && "manifest-about",
    informationPanel?.renderAnnotation && hasAnnotationContent(input) && "manifest-annotations",
    informationPanel?.renderContentSearch && contentSearchResource && "manifest-content-search",
    ...(pluginsWithInfoPanel?.map((p) => p.id) ?? []),
  ];

  // remove falsy values
  return tabs.filter(Boolean) as string[];
}

export function getDefaultTab(
  availableTabs: string[],
  configDefaultTab?: string,
): string | undefined {
  return (
    (configDefaultTab &&
      availableTabs.includes(configDefaultTab) &&
      configDefaultTab) ||
    availableTabs[0] ||
    undefined
  );
}
