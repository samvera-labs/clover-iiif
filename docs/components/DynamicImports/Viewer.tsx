import {
  type CustomDisplay,
  ViewerConfigOptions,
  PluginConfig,
} from "src/context/viewer-context";
import dynamic from "next/dynamic";
import { useRouter } from "next/router";
import { ContentSearchQuery } from "src/types/annotations";

// todo: set this as a constant somewhere?
const defaultIiifContent =
  "https://api.dc.library.northwestern.edu/api/v2/works/71153379-4283-43be-8b0f-4e7e3bfda275?as=iiif";

const Viewer = dynamic(() => import("src/components/Viewer"), {
  ssr: false,
});

const CloverViewer = ({
  iiifContent = defaultIiifContent,
  options,
  customDisplays,
  iiifContentSearchQuery,
  plugins,
  contentStateCallback,
}: {
  iiifContent: string;
  options?: ViewerConfigOptions;
  customDisplays?: Array<CustomDisplay>;
  iiifContentSearchQuery?: ContentSearchQuery;
  plugins?: Array<PluginConfig>;
  contentStateCallback?: (json: any) => void;
}) => {
  const router = useRouter();
  const iiifResource = router.query["iiif-content"]
    ? (router.query["iiif-content"] as string)
    : iiifContent;

  /*
   * No `background` override. Clover defaults to `transparent`, so the Viewer picks up
   * whatever the page behind it is — which is what the docs want now that the page
   * background is token-driven.
   *
   * This used to force `#fff` / `rgb(17,17,17)` from a `isDark()` check, which pre-dated
   * those tokens and left the Viewer a slightly different shade from the page it sat on
   * (`#FCFCFD` light, `#111113` dark).
   */
  return (
    <Viewer
      contentStateCallback={contentStateCallback}
      iiifContent={iiifResource}
      iiifContentSearchQuery={iiifContentSearchQuery}
      options={options}
      key={iiifResource}
      {...(customDisplays && { customDisplays })}
      {...(plugins && { plugins })}
    />
  );
};

export default CloverViewer;
