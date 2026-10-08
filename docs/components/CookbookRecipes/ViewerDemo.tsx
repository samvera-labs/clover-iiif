import React, { useCallback } from "react";
import Router, { useRouter } from "next/router";

import CookbookCoverageTable from "docs/components/CookbookRecipes/CookbookCoverageTable";
import FeaturedGrid from "docs/components/CookbookRecipes/FeaturedGrid";
import CookbookViewerPanel from "docs/components/CookbookRecipes/CookbookViewerPanel";
import CustomManifest from "docs/components/CustomManifest/CustomManifest";
import { preloadViewer } from "docs/components/DynamicImports/Viewer";
import {
  IIIF_CONTENT_PARAM,
  iiifContentError,
  pushIiifContent,
  validIiifContent,
} from "docs/lib/iiif-content";
import { inertWhen } from "docs/lib/inert";
import styles from "docs/components/CookbookRecipes/ViewerDemo.module.css";

/**
 * The Viewer's demo page: a field for trying any IIIF resource, with the IIIF Cookbook's
 * recipes, and whether Clover covers each, tucked beneath it, and a grid of featured items
 * between the two. `intro` sits above the field, and `children` follow the grid, which is where the Cookbook section's heading
 * and introduction go.
 *
 * `iiif-content` in the URL decides what is on screen. With a loadable value the Viewer
 * slides in over the page, so a link such as `?iiif-content=<manifest>` lands straight on
 * that resource; without one, or with one that cannot be loaded, the page shows. The field,
 * the View buttons and Back only ever change the URL; nothing else holds that state.
 */
interface ViewerDemoProps {
  /** Text above the field, for saying what the demo is. */
  intro?: React.ReactNode;
  children?: React.ReactNode;
}

const ViewerDemo: React.FC<ViewerDemoProps> = ({ intro, children }) => {
  const router = useRouter();
  const resource = validIiifContent(router.query[IIIF_CONTENT_PARAM]);
  const open = resource !== undefined;

  /*
   * Through the singleton router rather than `router` from the hook, which is a new object
   * on every route change. These go to a memoized table and would otherwise re-render all
   * of its rows each time the URL changes.
   */
  const view = useCallback((next: string) => pushIiifContent(Router, next), []);
  const back = useCallback(() => pushIiifContent(Router), []);

  return (
    <>
      <div
        {...inertWhen(open)}
        aria-hidden={open || undefined}
        onFocus={preloadViewer}
      >
        {intro && <p className={styles.intro}>{intro}</p>}
        <CustomManifest
          placeholder="View a IIIF Manifest or valid IIIF resource"
          submitLabel="Enter"
          validate={iiifContentError}
        />
        <FeaturedGrid onView={view} onPreload={preloadViewer} />
        {children}
        <CookbookCoverageTable onView={view} onPreload={preloadViewer} />
      </div>
      <CookbookViewerPanel resource={resource} onBack={back} />
    </>
  );
};

export default ViewerDemo;
