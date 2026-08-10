import {
  Content,
  List,
  MapTabBody,
  Scroll,
  Trigger,
  Wrapper,
} from "src/components/Viewer/InformationPanel/InformationPanel.styled";
import React, { useEffect, useMemo, useState } from "react";
import {
  ViewerContextStore,
  useViewerDispatch,
  useViewerState,
  type PluginConfig,
} from "src/context/viewer-context";

import AnnotationPage from "src/components/Viewer/InformationPanel/Annotation/Page";
import ContentSearch from "src/components/Viewer/InformationPanel/ContentSearch/ContentSearch";
import { AnnotationResources, AnnotationResource } from "src/types/annotations";
import Information from "src/components/Viewer/InformationPanel/About/About";
import Map from "src/components/Map";
import {
  GeoreferenceAnnotation,
  NavPlaceDisplayLevel,
  NavPlaceResourceContext,
  NavPlaceResourceLevel,
  adaptGeoreferenceAnnotationForOverlay,
  createNavPlaceFeatureCollection,
  extractNavPlaceFeatures,
  getImageServiceId,
} from "src/lib/georef-helpers";
import { getPaintingResource } from "src/hooks/use-iiif";
import {
  InternationalString,
  AnnotationPageNormalized,
  CanvasNormalized,
  AnnotationNormalized,
} from "@iiif/presentation-3";
import { Icon } from "src/components/UI";
import { Label } from "src/components/Primitives";
import { setupPlugins } from "src/lib/plugin-helpers";
import ErrorFallback from "src/components/UI/ErrorFallback/ErrorFallback";

import { ErrorBoundary } from "react-error-boundary";
import { useCloverTranslation } from "src/i18n/useCloverTranslation";
import ContentStateAnnotationPage from "./ContentState/Page";
import AnnotationCollectionPage from "./AnnotationCollection/Page";
import { annotationMatchesMotivations } from "src/lib/annotation-helpers";

const UserScrollTimeout = 1500; // 1500ms without a user-generated scroll event reverts to auto-scrolling

// ── navPlace / georef helpers (shared with the map tab) ──────────────────────

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const getNavPlaceContext = (resource: any, parent?: NavPlaceResourceContext): NavPlaceResourceContext | undefined => {
  if (!resource) return undefined;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const firstUrl = (list: unknown): string | undefined => {
    if (!list) return undefined;
    const arr = Array.isArray(list) ? list : [list];
    const first = arr.find(Boolean);
    if (!first || typeof first !== "object") return undefined;
    return (first as any).id || (first as any)["@id"];
  };
  return {
    id: resource.id || resource["@id"],
    type: resource.type || resource["@type"],
    label: resource.label ?? null,
    summary: resource.summary ?? null,
    thumbnail: firstUrl(resource.thumbnail),
    homepage: firstUrl(resource.homepage),
    parent,
  };
};

interface NavigatorProps {
  activeCanvas: string;
  annotationResources?: AnnotationResources;
  searchServiceUrl?: string;
  setContentSearchResource: React.Dispatch<
    React.SetStateAction<AnnotationPageNormalized | undefined>
  >;
  contentSearchResource?: AnnotationResource;
  contentSearchCallback?: (query: string) => void;
  initialSearchQuery?: string;
}

export const InformationPanel: React.FC<NavigatorProps> = ({
  activeCanvas,
  annotationResources,
  searchServiceUrl,
  setContentSearchResource,
  contentSearchResource,
  contentSearchCallback,
  initialSearchQuery,
}) => {
  const { t } = useCloverTranslation();
  const dispatch = useViewerDispatch();
  const viewerState: ViewerContextStore = useViewerState();
  const {
    activeManifest,
    annotationCollection,
    collection,
    contentStateAnnotation,
    informationPanelResource,
    isAutoScrolling,
    isUserScrolling,
    vault,
    configOptions,
    plugins,
    visibleCanvases,
  } = viewerState;
  const { informationPanel } = configOptions;

  const renderAbout = informationPanel?.renderAbout;
  const renderAnnotation = informationPanel?.renderAnnotation;
  const hasAnnotationCollection = Boolean(annotationCollection?.pages?.length);
  const canvas = vault.get({
    id: activeCanvas,
    type: "Canvas",
  }) as CanvasNormalized;

  const renderContentSearch = informationPanel?.renderContentSearch;
  const renderToggle = informationPanel?.renderToggle;
  const allowedAnnotationMotivations = configOptions?.annotations?.motivations;
  const contentStateAnnotationSource =
    // @ts-ignore
    contentStateAnnotation?.target?.source || contentStateAnnotation?.target;
  const hasContentStateAnnotation =
    Boolean(contentStateAnnotation) &&
    // @ts-ignore
    contentStateAnnotationSource.id === activeCanvas;
  const filteredAnnotationResources = useMemo(() => {
    if (!annotationResources) return [];
    if (!allowedAnnotationMotivations)
      return annotationResources;

    return annotationResources
      .map((annotationPage) => {
        if (!annotationPage?.items?.length) return null;

        const filteredItems = annotationPage.items.filter((item) => {
          const annotation = vault.get(item.id) as
            | AnnotationNormalized
            | undefined;
          return annotationMatchesMotivations(
            annotation,
            allowedAnnotationMotivations,
          );
        });

        if (!filteredItems.length) return null;

        return {
          ...annotationPage,
          items: filteredItems,
        };
      })
      .filter(Boolean) as AnnotationResources;
  }, [annotationResources, allowedAnnotationMotivations, vault]);
  const hasAnnotations =
    Boolean(filteredAnnotationResources?.length) ||
    hasContentStateAnnotation ||
    hasAnnotationCollection;

  // ── Map tab data ────────────────────────────────────────────────────────────

  const [mapGeorefAnnotations, setMapGeorefAnnotations] = useState<GeoreferenceAnnotation[]>([]);

  /**
   * Preserve the previous array when the collected set hasn't actually changed.
   * The effect below re-runs whenever `vault` or `visibleCanvases` change
   * identity, so storing a fresh array every time would re-trigger it in a loop.
   */
  const keepOrReplace = (previous: GeoreferenceAnnotation[], next: GeoreferenceAnnotation[]) =>
    previous.length === next.length && previous.every((annotation, index) => annotation.id === next[index].id)
      ? previous
      : next;

  const mapNavPlace = useMemo(() => {
    if (!configOptions.map?.enabled) return null;

    const manifest = vault.get(activeManifest);
    const canvases = visibleCanvases.map((c) => vault.get(c.id)).filter(Boolean);
    const collectionResource =
      collection && Object.keys(collection).length > 0 ? collection : null;
    const collectionContext = getNavPlaceContext(collectionResource);
    const manifestContext = getNavPlaceContext(manifest, collectionContext);
    const configuredLevel = configOptions.map.navPlaceLevel ?? "auto";

    const featuresForLevel = (level: NavPlaceResourceLevel) => {
      if (level === "Collection")
        return collectionResource
          ? extractNavPlaceFeatures(collectionResource, { levels: ["Collection"] })
          : [];
      if (level === "Manifest")
        return manifest
          ? extractNavPlaceFeatures(manifest, { levels: ["Manifest"], parent: collectionContext })
          : [];
      return canvases.flatMap((canvas) =>
        extractNavPlaceFeatures(canvas, { levels: [level], parent: manifestContext }),
      );
    };

    const featuresForConfiguredLevel = (level: NavPlaceDisplayLevel): GeoJSON.Feature[] => {
      if (level === "all")
        return [
          ...featuresForLevel("Collection"),
          ...featuresForLevel("Manifest"),
          ...featuresForLevel("Canvas"),
          ...featuresForLevel("Annotation"),
        ];
      if (level !== "auto") return featuresForLevel(level);
      for (const l of ["Annotation", "Canvas", "Manifest", "Collection"] as NavPlaceResourceLevel[]) {
        const f = featuresForLevel(l);
        if (f.length) return f;
      }
      return [];
    };

    const features = featuresForConfiguredLevel(configuredLevel);
    return features.length ? createNavPlaceFeatureCollection(features) : null;
  }, [activeManifest, collection, configOptions.map?.enabled, configOptions.map?.navPlaceLevel, vault, visibleCanvases]);

  useEffect(() => {
    let isMounted = true;

    async function collectGeorefAnnotations() {
      if (!configOptions.map?.enabled || !configOptions.map?.showImageOverlay) {
        setMapGeorefAnnotations((previous) => keepOrReplace(previous, []));
        return;
      }

      const scope = configOptions.map?.overlayScope ?? "manifest";
      const manifest = vault.get(activeManifest);
      const canvasIds =
        scope === "canvas"
          ? visibleCanvases.map((c) => c.id)
          : ((manifest?.items ?? []) as Array<{ id: string }>).map((item) => item.id);

      const collected: GeoreferenceAnnotation[] = [];
      const seen = new Set<string>();

      for (const canvasId of canvasIds) {
        const canvas = vault.get(canvasId);
        if (!canvas?.annotations?.length) continue;

        const paintingBodies = getPaintingResource(vault, canvasId) ?? [];
        const imageService = paintingBodies.map((body) => getImageServiceId(body)).find(Boolean);

        const pages = vault.get(canvas.annotations) as Array<{ id: string; items?: Array<{ id: string }> }>;

        for (const page of pages) {
          let items = page?.items;
          if (!items || items.length === 0) {
            try {
              // eslint-disable-next-line @typescript-eslint/no-explicit-any
              const loaded = (await vault.load(page.id)) as any;
              items = loaded?.items;
            } catch (error) {
              console.error(`Annotation page failed to load: ${error}`);
            }
          }
          if (!items?.length) continue;

          for (const itemRef of items) {
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            const annotation = vault.get(itemRef as any) as any;
            const motivations = Array.isArray(annotation?.motivation)
              ? annotation.motivation
              : [annotation?.motivation];
            if (!motivations.includes("georeferencing")) continue;
            if (annotation.id && seen.has(annotation.id)) continue;

            const bodyRefs = Array.isArray(annotation?.body)
              ? annotation.body
              : annotation?.body ? [annotation.body] : [];
            let featureCollection: GeoJSON.FeatureCollection | null = null;
            for (const ref of bodyRefs) {
              // eslint-disable-next-line @typescript-eslint/no-explicit-any
              const resolved = ref?.type === "FeatureCollection" ? ref : (vault.get(ref as any) as any);
              if (resolved?.type === "FeatureCollection") {
                featureCollection = { type: "FeatureCollection", features: resolved.features ?? [] };
                break;
              }
            }
            if (!featureCollection) continue;

            const source = annotation.target?.source;
            const storedSelectorValue = annotation.target?.selector?.value;
            const { width, height } = source ?? {};
            const selectorValue =
              storedSelectorValue ||
              (width && height
                ? `<svg width="${width}" height="${height}"><polygon points="0,0 ${width},0 ${width},${height} 0,${height}" /></svg>`
                : undefined);
            if (!selectorValue) continue;

            const candidate: GeoreferenceAnnotation = {
              "@context": ["http://iiif.io/api/extension/georef/1/context.json", "http://iiif.io/api/presentation/3/context.json"],
              id: annotation.id,
              type: "Annotation",
              motivation: "georeferencing",
              target: {
                type: "SpecificResource",
                source: { id: source?.id, type: source?.type, width: source?.width, height: source?.height },
                selector: { type: "SvgSelector", value: selectorValue },
              },
              body: featureCollection,
            };

            if (annotation.id) seen.add(annotation.id);

            if (source?.type === "Canvas") {
              if (!imageService) continue;
              collected.push(adaptGeoreferenceAnnotationForOverlay(candidate, imageService.id, imageService.type));
            } else {
              collected.push(candidate);
            }
          }
        }
      }

      if (isMounted) setMapGeorefAnnotations((previous) => keepOrReplace(previous, collected));
    }

    collectGeorefAnnotations();
    return () => { isMounted = false; };
  }, [activeManifest, configOptions.map?.enabled, configOptions.map?.showImageOverlay, configOptions.map?.overlayScope, vault, visibleCanvases]);

  const showMapTab = Boolean(
    configOptions.map?.enabled && (mapNavPlace || mapGeorefAnnotations.length),
  );

  // ── end map tab data ────────────────────────────────────────────────────────

  const { pluginsWithInfoPanel } = setupPlugins(plugins);

  function renderPluginInformationPanel(plugin: PluginConfig, i: number) {
    const PluginInformationPanelComponent = plugin?.informationPanel
      ?.component as unknown as React.ElementType;

    if (PluginInformationPanelComponent === undefined) {
      return <></>;
    }

    return (
      <Content key={i} value={plugin.id}>
        <ErrorBoundary FallbackComponent={ErrorFallback}>
          <PluginInformationPanelComponent
            {...plugin?.informationPanel?.componentProps}
            canvas={canvas}
            useViewerDispatch={useViewerDispatch}
            useViewerState={useViewerState}
          />
        </ErrorBoundary>
      </Content>
    );
  }

  /**
   * Close the information panel
   */
  const handleInformationPanelClose = () => {
    dispatch({
      type: "updateInformationOpen",
      isInformationOpen: false,
    });
  };

  useEffect(() => {
    /**
     * If a default tab is set, set the active tab to that value
     */
    if (
      [
        "manifest-about",
        "manifest-annotations",
        "manifest-content-search",
        "manifest-map",
      ].includes(String(informationPanel?.defaultTab))
    ) {
      dispatch({
        type: "updateInformationPanelResource",
        informationPanelResource: informationPanel?.defaultTab,
      });
    } else if (hasAnnotationCollection || hasContentStateAnnotation) {
      dispatch({
        type: "updateInformationPanelResource",
        informationPanelResource: "manifest-annotations",
      });
    } else {
      dispatch({
        type: "updateInformationPanelResource",
        informationPanelResource: "manifest-about",
      });
    }
  }, []);

  useEffect(() => {
    if (!hasAnnotations) {
      dispatch({
        type: "updateInformationPanelResource",
        informationPanelResource: "manifest-about",
      });
    }
  }, [hasAnnotations]);

  function handleScroll() {
    if (!isAutoScrolling) {
      clearTimeout(isUserScrolling);
      const timeout = setTimeout(() => {
        dispatch({
          type: "updateUserScrolling",
          isUserScrolling: undefined,
        });
      }, UserScrollTimeout);

      dispatch({
        type: "updateUserScrolling",
        isUserScrolling: timeout as unknown as number,
      });
    }
  }

  const handleValueChange = (value: string) => {
    dispatch({
      type: "updateInformationPanelResource",
      informationPanelResource: value,
    });
  };

  return (
    <Wrapper
      data-testid="information-panel"
      defaultValue={informationPanelResource}
      onValueChange={handleValueChange}
      orientation="horizontal"
      value={informationPanelResource}
      className="clover-viewer-information-panel"
    >
      <List
        aria-label={t("informationPanelTabs")}
        data-testid="information-panel-list"
      >
        {renderToggle && (
          <Trigger
            value="manifest-back"
            data-value="manifest-back"
            onClick={handleInformationPanelClose}
            as={"button"}
            aria-label={t("informationPanelTabsClose")}
          >
            <Icon fill="currentColor" aria-hidden="true">
              <Icon.PanelExpand />
            </Icon>
          </Trigger>
        )}
        {renderAbout && (
          <Trigger value="manifest-about">
            {t("informationPanelTabsAbout")}
          </Trigger>
        )}
        {renderContentSearch && contentSearchResource && (
          <Trigger value="manifest-content-search">
            {t("informationPanelTabsSearch")}
          </Trigger>
        )}
        {renderAnnotation && hasAnnotations && (
          <Trigger value="manifest-annotations">
            {informationPanel?.annotationTabLabel ||
              t("informationPanelTabsAnnotations")}
          </Trigger>
        )}
        {showMapTab && (
          <Trigger value="manifest-map">
            {t("informationPanelTabsMap")}
          </Trigger>
        )}
        {pluginsWithInfoPanel &&
          pluginsWithInfoPanel.map((plugin, i) => (
            <Trigger key={i} value={plugin.id}>
              <Label
                label={plugin.informationPanel?.label as InternationalString}
              />
            </Trigger>
          ))}
      </List>
      <Scroll handleScroll={handleScroll}>
        {renderAbout && (
          <Content value="manifest-about">
            <Information />
          </Content>
        )}
        {renderContentSearch && contentSearchResource && (
          <Content value="manifest-content-search">
            <ContentSearch
              searchServiceUrl={searchServiceUrl}
              setContentSearchResource={setContentSearchResource}
              activeCanvas={activeCanvas}
              annotationPage={contentSearchResource}
              contentSearchCallback={contentSearchCallback}
              initialSearchQuery={initialSearchQuery}
            />
          </Content>
        )}
        {renderAnnotation && hasAnnotations && (
          <Content value="manifest-annotations">
            {contentStateAnnotation && hasContentStateAnnotation && (
              <ContentStateAnnotationPage
                contentStateAnnotation={contentStateAnnotation}
              />
            )}
            {filteredAnnotationResources.map((annotationPage) => (
              <AnnotationPage
                key={annotationPage.id}
                annotationPage={annotationPage}
              />
            ))}
            {hasAnnotationCollection && (
              <AnnotationCollectionPage annotationCollection={annotationCollection!} />
            )}
          </Content>
        )}

        {showMapTab && (
          <Content value="manifest-map">
            <MapTabBody>
              <Map
                navPlace={mapNavPlace}
                georefAnnotations={mapGeorefAnnotations}
                showImageOverlay={configOptions.map?.showImageOverlay}
                imageOverlayOpacity={configOptions.map?.imageOverlayOpacity}
                showControlPoints={configOptions.map?.showControlPoints}
                fitToData={configOptions.map?.fitToData}
              />
            </MapTabBody>
          </Content>
        )}
        {pluginsWithInfoPanel &&
          pluginsWithInfoPanel.map((plugin, i) =>
            renderPluginInformationPanel(plugin, i),
          )}
      </Scroll>
    </Wrapper>
  );
};

export default InformationPanel;
