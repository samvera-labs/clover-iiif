import { setupPlugins } from "./plugin-helpers";
import { PluginConfig } from "../context/viewer-context";

describe("setupPlugins", () => {
  const ViewerComponent = () => {
    return <div>Info</div>;
  };

  const InfoPanelComponent = () => {
    return <div>Info</div>;
  };

  it("returns plugins that have information panel", () => {
    const plugin: PluginConfig = {
      id: "plugin",
      imageViewer: {
        controls: {
          component: ViewerComponent,
          componentProps: { prop_a: "prop_a_value" },
        },
      },
      informationPanel: {
        component: InfoPanelComponent,
        componentProps: { prop_b: "prop_b_value" },
        label: { en: ["label a"] },
      },
    };
    const res = setupPlugins([plugin]);

    const expected = {
      pluginsWithInfoPanel: [plugin],
    };
    expect(res).toStrictEqual(expected);
  });

  it("returns empty arrays if plugins do not have information panel", () => {
    const plugin: PluginConfig = {
      id: "plugin",
      imageViewer: {
        controls: {
          component: ViewerComponent,
          componentProps: { prop_a: "prop_a_value" },
        },
      },
    };
    const res = setupPlugins([plugin]);

    const expected = {
      pluginsWithInfoPanel: [],
    };
    expect(res).toStrictEqual(expected);
  });
});
