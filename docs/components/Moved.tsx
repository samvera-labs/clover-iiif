import Link from "next/link";
import { useRouter } from "next/router";
import React, { useEffect, useState } from "react";

/**
 * Where a page went when Clover 4 became the docs' focus: 3.x moved under /docs/3.x, and
 * 4.x up from /docs/4.x. A 3.x page whose name 4.x now uses (/docs/viewer, /docs/map,
 * /docs/composing) shows the 4.x page instead, which links back to its 3.x version.
 */
const MOVES: [RegExp, string][] = [
  [/^\/docs\/4\.x(\/.*)?$/, "/docs$1"],
  [
    /^\/docs\/(image|scroll|slider|homepage|label|metadata|partOf|rendering|requiredStatement|seeAlso|summary|thumbnail|i18n)(\/.*)?$/,
    "/docs/3.x/$1$2",
  ],
  /*
   * The 3.x Viewer's own pages: content state, search and prefetched content. Its demo's
   * address, /docs/viewer/demo, is Clover 4's demo now, and iiif.io's recipe pages link
   * there, so it never reaches this page.
   */
  [/^\/docs\/viewer\/(.+)$/, "/docs/3.x/viewer/$1"],
];

/** The page moved to from `path`, or nothing. */
export function movedTo(path: string): string | null {
  const clean = path.replace(/\/+$/, "") || "/";
  for (const [pattern, target] of MOVES) {
    if (pattern.test(clean)) return clean.replace(pattern, target);
  }
  return null;
}

/**
 * The 404 page. The docs are a static export, so there are no server redirects; GitHub
 * Pages serves this page for any missing path instead, and it sends a moved one on.
 */
export function Moved() {
  const router = useRouter();
  const [target, setTarget] = useState<string | null | undefined>(undefined);

  useEffect(() => {
    const path = window.location.pathname.slice(router.basePath.length);
    const next = movedTo(path);
    setTarget(next);
    if (next) {
      router.replace(next + window.location.search + window.location.hash);
    }
  }, [router]);

  if (target === undefined) return null;
  return (
    <div style={{ padding: "4rem 0", textAlign: "center" }}>
      {target ? (
        <p>
          This page has moved to <Link href={target}>{target}</Link>.
        </p>
      ) : (
        <>
          <h1 style={{ fontSize: "1.5rem", fontWeight: 600 }}>
            Page not found
          </h1>
          <p style={{ marginTop: "1rem" }}>
            Start from the <Link href="/docs">docs</Link>, or the{" "}
            <Link href="/docs/3.x">Clover 3.x docs</Link>.
          </p>
        </>
      )}
    </div>
  );
}
