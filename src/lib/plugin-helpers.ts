import { AnnotationNormalized, Reference } from "@iiif/presentation-3";
import { type PluginConfig } from "src/context/viewer-context";
import { AnnotationResources } from "src/types/annotations";
import { type Vault } from "@iiif/vault";

export function setupPlugins(plugins: PluginConfig[]) {
  const pluginsWithInfoPanel: PluginConfig[] = [];
  const pluginsAnnotationPageIds: string[] = [];
  plugins.forEach((plugin) => {
    if (plugin.informationPanel?.component) {
      pluginsWithInfoPanel.push(plugin);
    }
    const annotationPageId = plugin?.informationPanel?.componentProps
      ?.annotationServer as string;
    if (annotationPageId) {
      pluginsAnnotationPageIds.push(annotationPageId);
    }
  });

  return { pluginsWithInfoPanel, pluginsAnnotationPageIds };
}

export function formatPluginAnnotations(
  plugin: PluginConfig,
  annotationResources: AnnotationResources | undefined,
  vault: Vault | undefined = undefined,
) {
  const annotationPageId =
    plugin?.informationPanel?.componentProps?.annotationServer;

  let annotations: (AnnotationNormalized | Reference<"Annotation">)[] = [];
  if (
    annotationPageId &&
    annotationResources &&
    annotationResources.length > 0
  ) {
    const annotationPage = annotationResources?.find((resource) => {
      return resource.id === annotationPageId;
    });
    if (annotationPage) {
      if (vault) {
        annotations = annotationPage.items.map((item) => {
          // populate data for annotation
          let annotation;
          try {
            annotation = vault.get(item.id) as AnnotationNormalized;
          } catch (error) {
            console.error(error);
          }
          // populate data for annotation.body
          if (annotation.body) {
            return {
              ...annotation,
              body: annotation.body
                .filter((body) => {
                  try {
                    return vault.get(body.id);
                  } catch (error) {
                    console.error(error);
                  }
                })
                .map((body) => {
                  return vault.get(body.id);
                }),
            };
          } else {
            return {
              ...annotation,
              body: [],
            };
          }
        });
      } else {
        annotations = annotationPage.items;
      }
    }
  }

  return annotations;
}
