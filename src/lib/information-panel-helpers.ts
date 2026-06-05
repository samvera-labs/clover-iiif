interface ContentStateAnnotationLike {
  id?: string;
  type?: unknown;
  motivation?: unknown;
  body?: unknown;
  target?: unknown;
}

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

function hasAnnotationContent(input: PanelVisibilityInput): boolean {
  const {
    annotationResources,
    filteredAnnotationResources,
    contentStateAnnotation,
    annotationCollection,
    activeCanvas,
    activeCanvases,
  } = input;

  // Use filtered resources when available (respects motivation filtering);
  // fall back to unfiltered for callers that don't filter (e.g., Content.tsx).
  const resources = filteredAnnotationResources ?? annotationResources;
  const hasFilteredResources = (resources?.length ?? 0) > 0;

  const activeCanvasIds =
    activeCanvases ?? (activeCanvas ? [activeCanvas] : undefined);

  const hasCanvasScopedContentState = activeCanvasIds
    ? activeCanvasIds.some((canvasId) =>
        annotationTargetsCanvas(contentStateAnnotation, canvasId),
      )
    : Boolean(contentStateAnnotation);

  const hasCollectionPages = (annotationCollection?.pages?.length ?? 0) > 0;

  return (
    hasFilteredResources || hasCanvasScopedContentState || hasCollectionPages
  );
}

export function hasAnyPanel(input: PanelVisibilityInput): boolean {
  const { informationPanel, contentSearchResource, pluginsWithInfoPanel } =
    input;

  if (informationPanel?.renderAbout) return true;
  if (informationPanel?.renderAnnotation && hasAnnotationContent(input))
    return true;
  if (informationPanel?.renderContentSearch && contentSearchResource)
    return true;
  if (pluginsWithInfoPanel && pluginsWithInfoPanel.length > 0) return true;

  return false;
}

export function getAvailableTabs(input: PanelVisibilityInput): string[] {
  const { informationPanel, contentSearchResource, pluginsWithInfoPanel } =
    input;

  const tabs = [
    informationPanel?.renderAbout && "manifest-about",
    informationPanel?.renderAnnotation &&
      hasAnnotationContent(input) &&
      "manifest-annotations",
    informationPanel?.renderContentSearch &&
      contentSearchResource &&
      "manifest-content-search",
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
