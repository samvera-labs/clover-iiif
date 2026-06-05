interface ContentStateAnnotationLike {
  id?: string;
  type?: unknown;
  motivation?: unknown;
  body?: unknown;
  target?: unknown;
}

export const INFORMATION_PANEL_TABS = {
  about: "manifest-about",
  annotations: "manifest-annotations",
  contentSearch: "manifest-content-search",
} as const;

export interface PanelVisibilityInput {
  informationPanel?: {
    renderAbout?: boolean;
    renderAnnotation?: boolean;
    renderContentSearch?: boolean;
    defaultTab?: string;
  };
  annotationResources?: readonly unknown[];
  filteredAnnotationResources?: readonly unknown[];
  contentSearchResource?: unknown;
  pluginsWithInfoPanel?: ReadonlyArray<{ id: string }>;
  contentStateAnnotation?: ContentStateAnnotationLike | null;
  annotationCollection?: { pages?: readonly unknown[] } | null;
  activeCanvas?: string;
  activeCanvases?: string[];
}

/**
 * Extract the target resource from a IIIF content state annotation.
 * Handles both SpecificResource (with .source) and direct target shapes.
 */
function getContentStateTargetIds(
  annotation: ContentStateAnnotationLike | null | undefined,
): string[] {
  if (!annotation?.target) return [];

  const targets = Array.isArray(annotation.target)
    ? annotation.target
    : [annotation.target];

  return targets
    .map(getTargetResourceId)
    .filter((id): id is string => Boolean(id));
}

function getTargetResourceId(target: unknown): string | undefined {
  if (typeof target === "string") return target;

  if (!isRecord(target)) return undefined;

  // IIIF content state target shape varies: may be a SpecificResource with a
  // `source` property, or a direct reference with an `id`.
  return getResourceId(target.source) ?? getResourceId(target);
}

function getResourceId(resource: unknown): string | undefined {
  if (typeof resource === "string") return resource;
  if (isRecord(resource) && typeof resource.id === "string") {
    return resource.id;
  }

  return undefined;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

export function annotationTargetsCanvas(
  annotation: ContentStateAnnotationLike | null | undefined,
  activeCanvas: string,
): boolean {
  return getContentStateTargetIds(annotation).includes(activeCanvas);
}

/**
 * Check whether a content state annotation targets any of the relevant
 * canvases. When no canvas context is provided, just checks existence.
 */
function contentStateForCanvas(
  annotation: ContentStateAnnotationLike | null | undefined,
  activeCanvases: string[] | undefined,
  activeCanvas: string | undefined,
): boolean {
  if (!annotation) return false;

  if (activeCanvases && activeCanvases.length > 0) {
    return activeCanvases.some((id) => annotationTargetsCanvas(annotation, id));
  }

  if (activeCanvas) {
    return annotationTargetsCanvas(annotation, activeCanvas);
  }

  // Without canvas context, preserve the legacy existence check.
  return true;
}

function hasAnnotationContent(input: PanelVisibilityInput): boolean {
  const {
    annotationResources,
    filteredAnnotationResources,
    contentStateAnnotation,
    annotationCollection,
    activeCanvas,
    activeCanvases,
  } = input;

  const resources = filteredAnnotationResources ?? annotationResources;
  const hasFilteredResources = (resources?.length ?? 0) > 0;

  const hasCanvasScopedContentState = contentStateForCanvas(
    contentStateAnnotation,
    activeCanvases,
    activeCanvas,
  );

  const hasCollectionPages = (annotationCollection?.pages?.length ?? 0) > 0;

  return (
    hasFilteredResources || hasCanvasScopedContentState || hasCollectionPages
  );
}

export function getAvailableTabs(input: PanelVisibilityInput): string[] {
  const { informationPanel, contentSearchResource, pluginsWithInfoPanel } =
    input;

  const tabs: string[] = [];

  if (informationPanel?.renderAbout) {
    tabs.push(INFORMATION_PANEL_TABS.about);
  }
  if (informationPanel?.renderAnnotation && hasAnnotationContent(input)) {
    tabs.push(INFORMATION_PANEL_TABS.annotations);
  }
  if (informationPanel?.renderContentSearch && contentSearchResource) {
    tabs.push(INFORMATION_PANEL_TABS.contentSearch);
  }

  tabs.push(...(pluginsWithInfoPanel?.map((plugin) => plugin.id) ?? []));

  return tabs;
}

export function getDefaultTab(
  availableTabs: string[],
  configDefaultTab?: string,
): string | undefined {
  if (configDefaultTab && availableTabs.includes(configDefaultTab)) {
    return configDefaultTab;
  }

  return availableTabs[0];
}
