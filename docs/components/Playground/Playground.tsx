import React, { useCallback, useEffect, useMemo, useState } from "react";
import {
  type ComponentKey,
  type Control,
  accentPresets,
  coerce,
  componentOrder,
  componentSpecs,
  setPath,
} from "docs/components/Playground/playground-config";

import { applyAccent, readStoredAccent, storeAccent } from "docs/lib/accent";

import Image from "docs/components/DynamicImports/Image";
import Link from "next/link";
import Map from "docs/components/DynamicImports/Map";
import PrimitivesPanel from "docs/components/Playground/PrimitivesPanel";
import Scroll from "docs/components/DynamicImports/Scroll";
import Slider from "docs/components/DynamicImports/Slider";
import Viewer from "docs/components/DynamicImports/Viewer";
import { cookbookRecipes } from "docs/components/CookbookRecipes/CookbookRecipeSelect";
import styles from "docs/components/Playground/Playground.module.css";
import { useRouter } from "next/router";

/** Control values keyed by dot path, per component. */
type ControlState = Record<string, string | boolean>;

const defaultsFor = (key: ComponentKey): ControlState =>
  componentSpecs[key].controls.reduce<ControlState>((acc, control) => {
    acc[control.path] = control.default;
    return acc;
  }, {});

/** Renders the value as it would appear in JSX source. */
const literal = (value: unknown): string =>
  typeof value === "string" ? `"${value}"` : String(value);

/** Pretty-prints a nested options object as JSX-embedded JS. */
const printObject = (value: Record<string, any>, indent = 4): string => {
  const pad = " ".repeat(indent);
  const entries = Object.entries(value).map(([k, v]) => {
    const key = /^[A-Za-z_$][\w$]*$/.test(k) ? k : `"${k}"`;
    if (v && typeof v === "object" && !Array.isArray(v))
      return `${pad}${key}: ${printObject(v, indent + 2)}`;
    return `${pad}${key}: ${literal(v)}`;
  });
  return `{\n${entries.join(",\n")}\n${" ".repeat(indent - 2)}}`;
};

/**
 * The playground — a section of the homepage, not a page of its own.
 *
 * There used to be both a bento grid of live component cards and a separate
 * `/playground` route. Two live showcases on one site is redundant, so they are
 * one thing: this panel is the homepage's centrepiece, and its tab bar is what
 * communicates the library's surface area.
 *
 * Only the selected component is mounted, so a page load boots one viewer rather
 * than six.
 */
const Playground: React.FC = () => {
  const router = useRouter();

  const [active, setActive] = useState<ComponentKey>("viewer");
  const [resource, setResource] = useState(
    componentSpecs.viewer.defaultResource,
  );
  const [controls, setControls] = useState<ControlState>(defaultsFor("viewer"));
  const [accent, setAccent] = useState("");
  const [copied, setCopied] = useState(false);

  const spec = componentSpecs[active];

  /**
   * Read state out of the URL once the router is ready, so a shared link restores
   * the configuration. `iiif-content` is honored as well as the shorter `r`,
   * because that is the parameter Clover has always accepted for handing a
   * resource to the docs.
   */
  useEffect(() => {
    if (!router.isReady) return;

    const q = router.query;
    const nextComponent = (
      typeof q.c === "string" && q.c in componentSpecs ? q.c : "viewer"
    ) as ComponentKey;
    const nextResource =
      (typeof q["iiif-content"] === "string" && q["iiif-content"]) ||
      (typeof q.r === "string" && q.r) ||
      componentSpecs[nextComponent].defaultResource;

    setActive(nextComponent);
    setResource(nextResource);
    setControls(defaultsFor(nextComponent));

    // A shared link wins; otherwise pick up whatever accent is already in effect so
    // the matching swatch reads as selected.
    setAccent(typeof q.accent === "string" ? q.accent : readStoredAccent());
    // Only on first ready — later changes are pushed by the handlers below.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [router.isReady]);

  /**
   * Push the chosen accent at the document root and remember it.
   *
   * Deliberately no cleanup on unmount: the accent is a site-wide setting, so it has
   * to outlive this component when the reader navigates into the docs. `_app`
   * restores it on a cold load. See `docs/lib/accent.ts`.
   */
  useEffect(() => {
    applyAccent(accent);
    storeAccent(accent);
  }, [accent]);

  /** Mirror the shareable parts of the state into the URL, without a navigation. */
  const syncUrl = useCallback(
    (next: { c?: ComponentKey; r?: string; accent?: string }) => {
      const query: Record<string, string> = {
        c: next.c ?? active,
        r: next.r ?? resource,
      };
      const nextAccent = next.accent ?? accent;
      if (nextAccent) query.accent = nextAccent;
      router.replace({ query }, undefined, { shallow: true });
    },
    [active, resource, accent, router],
  );

  const selectComponent = (key: ComponentKey) => {
    setActive(key);
    setControls(defaultsFor(key));
    setResource(componentSpecs[key].defaultResource);
    syncUrl({ c: key, r: componentSpecs[key].defaultResource });
  };

  const updateControl = (path: string, value: string | boolean) =>
    setControls((prev) => ({ ...prev, [path]: value }));

  /** Control values assembled into the shape the component actually takes. */
  const assembled = useMemo(() => {
    const bag: Record<string, any> = {};
    spec.controls.forEach((control) => {
      const raw = controls[control.path];
      const value =
        control.kind === "toggle"
          ? Boolean(raw)
          : coerce(control.path, String(raw));
      setPath(bag, control.path, value);
    });
    return bag;
  }, [spec, controls]);

  /** The live JSX snippet, regenerated on every knob turn. */
  const snippet = useMemo(() => {
    if (spec.snippetOverride) return spec.snippetOverride;

    const props: string[] = [`  ${spec.resourceProp}="${resource}"`];

    if (spec.controlTarget === "options") {
      if (Object.keys(assembled).length)
        props.push(`  options={${printObject(assembled)}}`);
    } else {
      Object.entries(assembled).forEach(([key, value]) => {
        if (value && typeof value === "object")
          props.push(`  ${key}={${printObject(value)}}`);
        else if (typeof value === "boolean")
          props.push(value ? `  ${key}` : `  ${key}={false}`);
        else props.push(`  ${key}=${literal(value)}`);
      });
    }

    const themeLine = accent
      ? `\n\n// Theme it from the outside — no customTheme prop needed.\n` +
        `// <div style={{ "--clover-color-accent": "${accent}" }}> … </div>`
      : "";

    return (
      `import ${spec.displayName} from "${spec.importPath}";\n\n` +
      `<${spec.displayName}\n${props.join("\n")}\n/>${themeLine}`
    );
  }, [spec, resource, assembled, accent]);

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(snippet);
      setCopied(true);
      setTimeout(() => setCopied(false), 1600);
    } catch {
      setCopied(false);
    }
  };

  /**
   * The rendered component. Keyed on the resource and component so switching either
   * remounts cleanly rather than trying to reconcile a Viewer into a Map.
   */
  const preview = () => {
    const key = `${active}-${resource}`;
    switch (active) {
      case "viewer":
        return <Viewer key={key} iiifContent={resource} options={assembled} />;
      case "image":
        return (
          <Image
            key={key}
            src={resource}
            /* Names the zoomable region for assistive technology. Clover's IIIF
             * deep-zoom component, not an `img` — the jsx-a11y/alt-text warning is
             * a false positive on the identifier name. */
            label="IIIF image preview"
            openSeadragonConfig={assembled.openSeadragonConfig}
          />
        );
      case "map":
        return (
          <Map
            key={key}
            iiifContent={resource}
            fitToData={assembled.fitToData}
            scrollZoom={assembled.scrollZoom}
            useCrosshairCursor={assembled.useCrosshairCursor}
          />
        );
      case "slider":
        return <Slider key={key} iiifContent={resource} options={assembled} />;
      case "scroll":
        return <Scroll key={key} iiifContent={resource} options={assembled} />;
      case "primitives":
        return <PrimitivesPanel />;
    }
  };

  const renderControl = (control: Control) => {
    if (control.kind === "toggle") {
      return (
        <label className={styles.toggleRow} key={control.path}>
          <input
            type="checkbox"
            checked={Boolean(controls[control.path])}
            onChange={(e) => updateControl(control.path, e.target.checked)}
          />
          <span className={styles.toggleText}>
            {control.label}
            {control.hint && (
              <span className={styles.hint}>{control.hint}</span>
            )}
          </span>
        </label>
      );
    }

    return (
      <div className={styles.field} key={control.path}>
        <label className={styles.fieldLabel} htmlFor={`c-${control.path}`}>
          {control.label}
          {control.hint && <span className={styles.hint}>{control.hint}</span>}
        </label>
        <select
          className={styles.select}
          id={`c-${control.path}`}
          value={String(controls[control.path])}
          onChange={(e) => updateControl(control.path, e.target.value)}
        >
          {control.options.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      </div>
    );
  };

  /** Cookbook recipes that Clover is known to support, for the preset picker. */
  const presets = useMemo(
    () => cookbookRecipes.filter((recipe) => recipe.supported),
    [],
  );

  return (
    <section className={styles.section} id="playground">
      <div className={styles.shell}>
        <header className={styles.head}>
          <h2 className={styles.title}>Try it</h2>
        </header>

        <div className={styles.tabs} role="tablist" aria-label="Component">
          {componentOrder.map((key) => (
            <button
              className={styles.tab}
              key={key}
              role="tab"
              type="button"
              aria-selected={key === active}
              onClick={() => selectComponent(key)}
            >
              {componentSpecs[key].label}
            </button>
          ))}
        </div>

        <div className={styles.layout}>
          <div>
            {/* Unstyled and unconstrained; the accent now comes from :root. */}
            <div className={styles.stage} data-component={active}>
              {preview()}
            </div>

            <div className={styles.codePanel}>
              <div className={styles.codeHead}>
                <p className={styles.codeTitle}>Generated code</p>
                <button
                  className={styles.copyButton}
                  onClick={copy}
                  type="button"
                >
                  {copied ? "Copied" : "Copy"}
                </button>
              </div>
              <pre className={styles.code}>{snippet}</pre>
            </div>
          </div>

          <aside className={styles.aside}>
            {/*
              The prominent way through to the active component's reference. Sits
              above the control tray and inside the sticky column, so it stays
              reachable however far the stage scrolls. Uses the same global class as
              the hero's "Get started".
            */}
            <Link
              className={`cta-solid ${styles.docsCta}`}
              href={spec.docsHref}
              key={spec.key}
            >
              {spec.label} documentation
              <span className="cta-arrow" aria-hidden="true">
                →
              </span>
            </Link>

            <div className={styles.rail}>
              {/* Primitives take IIIF property values, not a resource URL. */}
              {spec.resourceProp && (
                <div className={styles.group}>
                  <p className={styles.groupTitle}>Resource</p>
                  <div className={styles.field}>
                    <label className={styles.fieldLabel} htmlFor="pg-preset">
                      IIIF Cookbook preset
                    </label>
                    <select
                      className={styles.select}
                      id="pg-preset"
                      value={
                        presets.some((p) => p.resource === resource)
                          ? resource
                          : ""
                      }
                      onChange={(e) => {
                        setResource(e.target.value);
                        syncUrl({ r: e.target.value });
                      }}
                    >
                      <option value="">Custom / demo resource</option>
                      {presets.map((recipe) => (
                        <option key={recipe.id} value={recipe.resource}>
                          {recipe.title}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className={styles.field}>
                    <label className={styles.fieldLabel} htmlFor="pg-resource">
                      {spec.resourceProp}
                    </label>
                    <input
                      className={`${styles.input} ${styles.resourceInput}`}
                      id="pg-resource"
                      type="url"
                      value={resource}
                      onChange={(e) => setResource(e.target.value)}
                      onBlur={() => syncUrl({})}
                      spellCheck={false}
                    />
                  </div>
                </div>
              )}

              {spec.controls.length > 0 && (
                <div className={styles.group}>
                  <p className={styles.groupTitle}>Options</p>
                  {spec.controls.map(renderControl)}
                </div>
              )}

              <div className={styles.group}>
                <p className={styles.groupTitle}>Theme</p>
                <div className={styles.field}>
                  <span className={styles.fieldLabel}>
                    Accent
                    <span className={styles.hint}>
                      Sets --clover-color-accent on a wrapper. The component
                      picks it up through the cascade.
                    </span>
                  </span>
                  <div className={styles.swatches}>
                    {accentPresets.map((preset) => (
                      <button
                        aria-label={preset.name}
                        aria-pressed={accent === preset.value}
                        className={`${styles.swatch} ${
                          preset.value ? "" : styles.swatchDefault
                        }`}
                        key={preset.name}
                        onClick={() => {
                          setAccent(preset.value);
                          syncUrl({ accent: preset.value });
                        }}
                        style={
                          preset.value
                            ? { background: preset.value }
                            : undefined
                        }
                        title={preset.name}
                        type="button"
                      />
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </aside>
        </div>
      </div>
    </section>
  );
};

export default Playground;
