import { type PluginConfig } from "src/context/viewer-context";

export function setupPlugins(plugins: PluginConfig[]) {
  const pluginsWithInfoPanel: PluginConfig[] = [];
  plugins.forEach((plugin) => {
    if (plugin.informationPanel?.component) {
      pluginsWithInfoPanel.push(plugin);
    }
  });

  return { pluginsWithInfoPanel };
}
