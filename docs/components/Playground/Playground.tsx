import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import {
  type Control,
  type TemplateKey,
  propValue,
  templateOrder,
  templateSpecs,
} from "docs/components/Playground/playground-config";
import { normalizeHex, setPageTheme, usePageTheme } from "docs/lib/page-theme";

import Link from "next/link";
import { VIEWER_RECIPES } from "docs/components/Clover4/Demos";
import { demoResources } from "docs/lib/demo-resources";
import dynamic from "next/dynamic";
import styles from "docs/components/Playground/Playground.module.css";
import { useRouter } from "next/router";

/** Control values keyed by prop, for one template. */
type ControlState = Record<string, string | boolean>;

const defaultsFor = (key: TemplateKey): ControlState =>
  Object.fromEntries(
    templateSpecs[key].controls.map((control) => [
      control.prop,
      control.default,
    ]),
  );

/**
 * The Viewer in a template, as a page would write it: `<Viewer template={Document} />`.
 * Loaded on the client, since the renderer needs a browser.
 */
const TemplateViewer = dynamic(
  () =>
    Promise.all([
      import("@nulib/clover"),
      import("@nulib/clover/templates"),
    ]).then(([clover, templates]) => {
      const Viewer = clover.default as React.ComponentType<any>;
      function TemplateViewer({
        template,
        ...props
      }: { template: "Default" | "Document" | "Gallery" | "Text" } & Record<
        string,
        unknown
      >) {
        return <Viewer {...props} template={templates[template]} />;
      }
      return TemplateViewer;
    }),
  { ssr: false },
);

/**
 * Resources for the picker: two long Northwestern works and a multilingual manuscript,
 * then the Cookbook recipes the 4.x Viewer is checked against.
 */
const presets = [
  {
    title: "Long document, 338 canvases (individuals)",
    resource:
      "https://api.dc.library.northwestern.edu/api/v2/works/12531652-50d5-473b-bf1f-ca54c10e875d?as=iiif",
  },
  {
    title: "Paged notebook, 138 canvases (paged)",
    resource: demoResources.viewer,
  },
  { title: "Multilingual manuscript", resource: demoResources.scroll },
  {
    title: "Book with a table of contents",
    resource: templateSpecs.document.defaultResource,
  },
  ...VIEWER_RECIPES.map(([title, resource]) => ({ title, resource })),
];

/** A prop as JSX source: bare for `true`, braced for other non-strings. */
const printProp = (prop: string, value: unknown) =>
  value === true
    ? `  ${prop}`
    : typeof value === "string"
      ? `  ${prop}="${value}"`
      : `  ${prop}={${String(value)}}`;

/**
 * The homepage's hero: the Viewer in each template, live.
 *
 * The tabs are the templates (native radios inside labels, so the group gets arrow keys
 * and one tab stop for free); the drawer behind Configure picks the resource and the
 * template's own props, and shows the code for what is on the stage. Only the chosen
 * template is mounted.
 */
const Playground: React.FC = () => {
  const router = useRouter();

  const [active, setActive] = useState<TemplateKey>("default");
  const [resource, setResource] = useState(
    templateSpecs.default.defaultResource,
  );
  const [controls, setControls] = useState<ControlState>(
    defaultsFor("default"),
  );
  /*
   * The page's accent, set from the gear in the site header. The playground reads it for
   * its generated code and carries it in the share link; a link that names one sets it.
   */
  const { accent } = usePageTheme();
  const [copied, setCopied] = useState(false);

  const spec = templateSpecs[active];

  /*
   * Read state out of the URL once the router is ready, so a shared link restores it. The
   * resource travels as `iiif-content`, the parameter Clover has always read for a
   * resource handed to the docs.
   */
  useEffect(() => {
    if (!router.isReady) return;
    const q = router.query;
    const next = (
      typeof q.t === "string" && templateOrder.includes(q.t as TemplateKey)
        ? q.t
        : "default"
    ) as TemplateKey;
    setActive(next);
    setResource(
      (typeof q["iiif-content"] === "string" && q["iiif-content"]) ||
        templateSpecs[next].defaultResource,
    );
    setControls(defaultsFor(next));
    // A shared link's accent wins over the reader's stored one.
    if (typeof q.accent === "string") {
      setPageTheme({ accent: normalizeHex(q.accent) });
    }
    // Only on first ready; later changes are pushed by the handlers below.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [router.isReady]);

  /** Mirror the shareable parts of the state into the URL, without a navigation. */
  const syncUrl = useCallback(
    (next: { t?: TemplateKey; resource?: string }) => {
      const query: Record<string, string> = {
        t: next.t ?? active,
        "iiif-content": next.resource ?? resource,
      };
      if (accent) query.accent = accent;
      router.replace({ query }, undefined, { shallow: true });
    },
    [active, resource, accent, router],
  );

  /*
   * Keep the link's accent in step with the header's. Debounced, because the colour
   * wheel reports every frame of a drag and each would otherwise be a history entry.
   */
  const accentSynced = useRef(false);
  useEffect(() => {
    if (!router.isReady) return;
    if (!accentSynced.current) {
      accentSynced.current = true;
      return;
    }
    const timer = setTimeout(() => syncUrl({}), 300);
    return () => clearTimeout(timer);
    // Only the accent changing should rewrite the link here.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [accent, router.isReady]);

  const selectTemplate = (key: TemplateKey) => {
    setActive(key);
    setControls(defaultsFor(key));
    setResource(templateSpecs[key].defaultResource);
    syncUrl({ t: key, resource: templateSpecs[key].defaultResource });
  };

  const updateControl = (prop: string, value: string | boolean) =>
    setControls((prev) => ({ ...prev, [prop]: value }));

  /*
   * The options tray is a drawer, not a column, so the stage gets the full width of the
   * page. It is non-modal on purpose (no backdrop, nothing inert), because the point of
   * opening it is to change a value and watch the stage respond.
   */
  const [configOpen, setConfigOpen] = useState(false);
  const configTriggerRef = useRef<HTMLButtonElement>(null);
  const configCloseRef = useRef<HTMLButtonElement>(null);
  const closeConfig = useCallback(() => {
    setConfigOpen(false);
    configTriggerRef.current?.focus();
  }, []);
  useEffect(() => {
    if (configOpen) configCloseRef.current?.focus();
  }, [configOpen]);

  /** The props that differ from the template's defaults: passed, and printed. */
  const props = useMemo(
    () =>
      Object.fromEntries(
        spec.controls
          .filter((control) => controls[control.prop] !== control.default)
          .map((control) => [
            control.prop,
            propValue(control, controls[control.prop]),
          ]),
      ),
    [spec, controls],
  );

  /** The code for what is on the stage, regenerated on every knob turn. */
  const snippet = useMemo(() => {
    const isDefault = active === "default";
    const imports = [
      `import Viewer from "@nulib/clover";`,
      !isDefault && `import { ${spec.name} } from "@nulib/clover/templates";`,
      `import "@nulib/clover/styles.css";`,
      !isDefault && `import "@nulib/clover/templates.css";`,
    ].filter(Boolean);
    const lines = [
      `  iiifContent="${resource}"`,
      !isDefault && `  template={${spec.name}}`,
      ...Object.entries(props).map(([prop, value]) => printProp(prop, value)),
    ].filter(Boolean);
    const element = `<Viewer\n${lines.join("\n")}\n/>`;
    /*
     * The accent as CSS, on `body`, every part's ancestor already: it cascades, so it is
     * not a prop. No font: Clover takes its type from the page.
     */
    const style = accent
      ? `<style>{\`\n  body {\n    --clover-color-accent: ${accent};\n  }\n\`}</style>\n\n`
      : "";
    return `${imports.join("\n")}\n\n${style}${element}`;
  }, [active, spec, resource, props, accent]);

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(snippet);
      setCopied(true);
      setTimeout(() => setCopied(false), 1600);
    } catch {
      setCopied(false);
    }
  };

  const renderControl = (control: Control) => {
    if (control.kind === "toggle") {
      return (
        <label className={styles.toggleRow} key={control.prop}>
          <input
            type="checkbox"
            checked={Boolean(controls[control.prop])}
            onChange={(e) => updateControl(control.prop, e.target.checked)}
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
      <div className={styles.field} key={control.prop}>
        <label className={styles.fieldLabel} htmlFor={`c-${control.prop}`}>
          {control.label}
          {control.hint && <span className={styles.hint}>{control.hint}</span>}
        </label>
        <select
          className={styles.select}
          id={`c-${control.prop}`}
          value={String(controls[control.prop])}
          onChange={(e) => updateControl(control.prop, e.target.value)}
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

  return (
    <section
      aria-label="Try the templates"
      className={styles.section}
      id="playground"
    >
      <div className={styles.shell}>
        <div className={styles.toolbar}>
          <fieldset className={styles.cards} data-region="template">
            <legend className={styles.cardsLegend}>Template</legend>
            {templateOrder.map((key) => (
              <label
                className={styles.card}
                title={templateSpecs[key].blurb}
                data-selected={key === active}
                key={key}
              >
                <input
                  checked={key === active}
                  className={styles.cardInput}
                  name="playground-template"
                  onChange={() => selectTemplate(key)}
                  type="radio"
                  value={key}
                />
                <span className={styles.cardLabel}>
                  {templateSpecs[key].name}
                </span>
              </label>
            ))}
          </fieldset>
          <button
            aria-controls="pg-config"
            aria-expanded={configOpen}
            aria-label={`Configure ${spec.name}`}
            className={styles.configTrigger}
            onClick={() => (configOpen ? closeConfig() : setConfigOpen(true))}
            ref={configTriggerRef}
            title={`Configure ${spec.name}`}
            type="button"
          >
            <svg
              aria-hidden="true"
              fill="currentColor"
              height="18"
              viewBox="0 0 24 24"
              width="18"
            >
              <path d="M19.14 12.94c.04-.3.06-.61.06-.94 0-.32-.02-.64-.07-.94l2.03-1.58a.49.49 0 0 0 .12-.61l-1.92-3.32a.488.488 0 0 0-.59-.22l-2.39.96c-.5-.38-1.03-.7-1.62-.94l-.36-2.54a.484.484 0 0 0-.48-.41h-3.84c-.24 0-.43.17-.47.41l-.36 2.54c-.59.24-1.13.57-1.62.94l-2.39-.96c-.22-.08-.47 0-.59.22L2.74 8.87c-.12.21-.08.47.12.61l2.03 1.58c-.05.3-.09.63-.09.94s.02.64.07.94l-2.03 1.58a.49.49 0 0 0-.12.61l1.92 3.32c.12.22.37.29.59.22l2.39-.96c.5.38 1.03.7 1.62.94l.36 2.54c.05.24.24.41.48.41h3.84c.24 0 .44-.17.47-.41l.36-2.54c.59-.24 1.13-.56 1.62-.94l2.39.96c.22.08.47 0 .59-.22l1.92-3.32c.12-.22.07-.47-.12-.61l-2.01-1.58zM12 15.6c-1.98 0-3.6-1.62-3.6-3.6s1.62-3.6 3.6-3.6 3.6 1.62 3.6 3.6-1.62 3.6-3.6 3.6z" />
            </svg>
            <span className={styles.configLabel}>Configure</span>
          </button>
        </div>

        <p className={styles.blurb}>{spec.blurb}</p>

        <div className={styles.layout}>
          <div>
            {/* No font and no colour here: Clover takes both from the page. */}
            <div className={styles.stage} data-template={active}>
              <TemplateViewer
                key={`${active}-${resource}`}
                template={spec.name as "Default"}
                iiifContent={resource}
                {...props}
              />
            </div>

            {/* The generated code belongs to configuring, so it shows only while the drawer is open. */}
            {configOpen && (
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
            )}
          </div>

          {configOpen && (
            <aside
              aria-label={`${spec.name} options`}
              className={styles.aside}
              id="pg-config"
              onKeyDown={(e) => {
                if (e.key === "Escape") {
                  e.stopPropagation();
                  closeConfig();
                }
              }}
              role="dialog"
            >
              <button
                aria-label="Close options"
                className={styles.configClose}
                onClick={closeConfig}
                ref={configCloseRef}
                type="button"
              >
                ×
              </button>

              <Link
                className={`cta-solid ${styles.docsCta}`}
                href={spec.docsHref}
                key={spec.key}
              >
                Templates documentation
                <span className="cta-arrow" aria-hidden="true">
                  →
                </span>
              </Link>

              <div className={styles.rail}>
                <div className={styles.group}>
                  <p className={styles.groupTitle}>Resource</p>
                  <div className={styles.field}>
                    <label className={styles.fieldLabel} htmlFor="pg-preset">
                      Preset
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
                        syncUrl({ resource: e.target.value });
                      }}
                    >
                      <option value="">Your own resource</option>
                      {presets.map((preset) => (
                        <option key={preset.resource} value={preset.resource}>
                          {preset.title}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className={styles.field}>
                    <label className={styles.fieldLabel} htmlFor="pg-resource">
                      iiifContent
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

                {spec.controls.length > 0 && (
                  <div className={styles.group}>
                    <p className={styles.groupTitle}>{spec.name}</p>
                    {spec.controls.map(renderControl)}
                  </div>
                )}
              </div>
            </aside>
          )}
        </div>
      </div>
    </section>
  );
};

export default Playground;
