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

function hasAnnotationContent(input: PanelVisibilityInput): boolean {
  const {
    annotationResources,
    filteredAnnotationResources,
    contentStateAnnotation,
    annotationCollection,
    activeCanvas,
  } = input;

  // Use filtered resources when available (respects motivation filtering)
  const resources = filteredAnnotationResources ?? annotationResources;

  const hasFilteredResources = (resources?.length ?? 0) > 0;

  // Check content state annotation
  let hasCanvasScopedContentState = false;
  if (contentStateAnnotation) {
    if (!activeCanvas) {
      // When no activeCanvas context is available, any content state annotation counts
      hasCanvasScopedContentState = true;
    } else {
      // With an activeCanvas, only count if the content state targets it
      const target =
        // @ts-ignore — IIIF content state target shape varies
        contentStateAnnotation?.target?.source || contentStateAnnotation?.target;
      hasCanvasScopedContentState = Boolean(target) && target.id === activeCanvas;
    }
  }

  const hasCollectionPages = (annotationCollection?.pages?.length ?? 0) > 0;

  return hasFilteredResources || hasCanvasScopedContentState || hasCollectionPages;
}

export function hasAnyPanel(input: PanelVisibilityInput): boolean {
  return getAvailableTabs(input).length > 0;
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
    ...(pluginsWithInfoPanel?.map((p) => String(p.id)) ?? []),
  ];

  // remove falsy values
  return tabs.filter(Boolean) as string[];
}
