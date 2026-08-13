import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import {
  type ComponentKey,
  type Control,
  accentPresets,
  coerce,
  componentOrder,
  componentSpecs,
  setPath,
} from "docs/components/Playground/playground-config";

import { fontPresets } from "docs/lib/preview-fonts";
import {
  applyPageTheme,
  normalizeHex,
  readStoredPageTheme,
  storePageTheme,
} from "docs/lib/page-theme";

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
import { useTheme } from "nextra-theme-docs";

/** Control values keyed by dot path, per component. */
type ControlState = Record<string, string | boolean>;

/**
 * What the colour picker shows when no accent is set. A native `<input type="color">`
 * has no empty state, so it needs some hex to display; this is the docs' own
 * `--accent-9`, which is what the page is actually using at that point.
 */
const DEFAULT_ACCENT = "#3a5bc7";

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
 * one thing: this panel is the homepage's centrepiece, and its radio cards are what
 * communicate the library's surface area.
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
  const [font, setFont] = useState("");
  const [copied, setCopied] = useState(false);

  /*
   * Appearance shares Nextra's next-themes state rather than keeping its own, so this
   * control and the one in Nextra's chrome always agree. `theme` is undefined until the
   * client mounts — next-themes cannot know the resolved value during SSR — so the
   * active state is withheld until then instead of guessing and mismatching on hydration.
   */
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

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

    // A shared link wins; otherwise pick up whatever is already in effect so the
    // matching swatch and dropdown option read as selected.
    const stored = readStoredPageTheme();
    setAccent(
      typeof q.accent === "string" ? normalizeHex(q.accent) : stored.accent,
    );
    setFont(stored.font);
    // Only on first ready — later changes are pushed by the handlers below.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [router.isReady]);

  /**
   * Push the chosen accent and font at the document root, and remember both.
   *
   * Deliberately no cleanup on unmount: these are page-level settings, so they have to
   * outlive this component when the reader navigates into the docs. `_app` restores them
   * on a cold load. See `docs/lib/page-theme.ts`.
   */
  useEffect(() => {
    applyPageTheme({ accent, font });
    storePageTheme({ accent, font });
  }, [accent, font]);

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

  /** True when the accent came from the picker rather than a preset swatch. */
  const isCustomAccent =
    Boolean(accent) &&
    !accentPresets.some(
      (preset) => preset.value.toLowerCase() === accent.toLowerCase(),
    );

  /**
   * The hex in force. An unset accent still paints something — the docs' own
   * `--accent-9` — so the trigger and the colour input report that rather than nothing.
   */
  const effectiveAccent = accent || DEFAULT_ACCENT;

  /*
   * The hex field keeps its own draft so it can be typed into. Binding it straight to
   * `accent` would fight the typist: the first keystroke of "#0f766e" is "#", which is
   * not a colour, so state would clear it before the second character arrived. The draft
   * follows `accent` whenever the change came from somewhere else — a swatch, the wheel,
   * a shared link.
   */
  const [hexDraft, setHexDraft] = useState("");
  useEffect(() => setHexDraft(accent), [accent]);

  /*
   * Accent menu. Closes on Escape and on a click outside, and returns focus to the
   * trigger on Escape so the keyboard is never stranded. The colour input opens a native
   * picker that lives outside the document, so `pointerdown` inside the panel must not be
   * treated as an outside click — hence the containment check rather than a blur handler.
   */
  const [accentOpen, setAccentOpen] = useState(false);
  const accentRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!accentOpen) return;

    const onPointerDown = (event: PointerEvent) => {
      if (!accentRef.current?.contains(event.target as Node))
        setAccentOpen(false);
    };
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key !== "Escape") return;
      setAccentOpen(false);
      accentRef.current?.querySelector("button")?.focus();
    };

    document.addEventListener("pointerdown", onPointerDown);
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("pointerdown", onPointerDown);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [accentOpen]);

  const commitHex = (raw: string) => {
    const value = raw.trim();
    const hex = value.startsWith("#") ? value : `#${value}`;
    if (!/^#(?:[0-9a-f]{3}|[0-9a-f]{6})$/i.test(hex)) return false;

    const normalized = normalizeHex(hex);
    setAccent(normalized);
    syncUrl({ accent: normalized });
    return true;
  };

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

    const overrides = [
      accent && `"--clover-color-accent": "${accent}"`,
      font && `"--clover-font-sans": "${font.replace(/"/g, "'")}"`,
    ].filter(Boolean);

    const themeLine = overrides.length
      ? `\n\n// Color and type come from the wrapper, not from props.\n` +
        `// <div style={{ ${overrides.join(", ")} }}> … </div>`
      : "";

    return (
      `import ${spec.displayName} from "${spec.importPath}";\n\n` +
      `<${spec.displayName}\n${props.join("\n")}\n/>${themeLine}`
    );
  }, [spec, resource, assembled, accent, font]);

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

  /*
   * No visible heading: the selected card already communicates that a component is being
   * tried, so the section carries its name as `aria-label` for assistive technology
   * rather than as an `h2`.
   */
  return (
    <section
      aria-label="Try the components"
      className={styles.section}
      id="playground"
    >
      <div className={styles.shell}>
        {/*
         * Native radios inside labels rather than buttons with `role="tab"`. The group
         * gets arrow-key navigation and a single tab stop for free, and the card is the
         * label, so the whole surface is clickable without extra handlers.
         */}
        <fieldset className={styles.cards} data-region="component">
          <legend className={styles.cardsLegend}>Component</legend>
          {componentOrder.map((key) => (
            <label
              className={styles.card}
              data-selected={key === active}
              key={key}
            >
              <input
                checked={key === active}
                className={styles.cardInput}
                name="playground-component"
                onChange={() => selectComponent(key)}
                type="radio"
                value={key}
              />
              <span className={styles.cardLabel}>
                {componentSpecs[key].label}
              </span>
              <span className={styles.cardBlurb}>
                {componentSpecs[key].blurb}
              </span>
            </label>
          ))}
        </fieldset>

        {/*
         * The accent lives here, beside the component cards, rather than in the options
         * tray on the right. Everything in that tray is a prop or an `options` key on the
         * selected component; this is not. Clover reads its colours and type from CSS
         * custom properties on whatever contains it, so this control belongs to the page,
         * not to the component. The generated snippet still spells the distinction out in
         * a comment; the note here only promises that it works, since a reader standing in
         * front of a live control does not need the mechanism explained.
         */}
        <div className={styles.environment}>
          {/*
           * Controls before the note in the DOM, not reordered with CSS `order`, so that
           * reading order and tab order match what is on screen.
           */}
          <div className={styles.environmentControls}>
            <div className={styles.environmentControl}>
              <label className={styles.environmentLabel} htmlFor="pg-font">
                Font family
              </label>
              {/* Grouped so the sans/serif split is visible while staying one control. */}
              <select
                className={styles.select}
                id="pg-font"
                onChange={(e) => setFont(e.target.value)}
                value={font}
              >
                {fontPresets
                  .filter((preset) => !preset.category)
                  .map((preset) => (
                    <option key={preset.name} value={preset.value}>
                      {preset.name}
                    </option>
                  ))}
                {(["Sans serif", "Serif"] as const).map((category) => (
                  <optgroup key={category} label={category}>
                    {fontPresets
                      .filter((preset) => preset.category === category)
                      .map((preset) => (
                        <option key={preset.name} value={preset.value}>
                          {preset.name}
                        </option>
                      ))}
                  </optgroup>
                ))}
              </select>
            </div>

            <div className={styles.environmentControl}>
              <span className={styles.environmentLabel}>Appearance</span>
              <div
                aria-label="Appearance"
                className={styles.segmented}
                role="group"
              >
                {(["light", "dark", "system"] as const).map((option) => (
                  <button
                    aria-pressed={mounted ? theme === option : false}
                    className={styles.segment}
                    key={option}
                    onClick={() => setTheme(option)}
                    type="button"
                  >
                    {option === "system"
                      ? "System"
                      : option === "light"
                        ? "Light"
                        : "Dark"}
                  </button>
                ))}
              </div>
            </div>

            <div className={styles.environmentControl} ref={accentRef}>
              {/* Labelled "Color" for readers; `accent` stays the internal name and the
               * URL parameter, so links shared before this rename still resolve. */}
              <span className={styles.environmentLabel} id="pg-accent-label">
                Color
              </span>

              {/*
               * A disclosure rather than a listbox: the panel holds a colour input and a
               * text field as well as the presets, which is more than a set of options.
               * The trigger shows the hex actually in force, so it reports the state as
               * well as opening the menu.
               */}
              <button
                aria-expanded={accentOpen}
                aria-haspopup="true"
                aria-labelledby="pg-accent-label"
                className={styles.accentTrigger}
                onClick={() => setAccentOpen((open) => !open)}
                type="button"
              >
                <span
                  aria-hidden="true"
                  className={styles.accentDot}
                  style={{ background: effectiveAccent }}
                />
                <span className={styles.accentHex}>
                  {effectiveAccent.toUpperCase()}
                </span>
                <span aria-hidden="true" className={styles.accentCaret}>
                  ▾
                </span>
              </button>

              {accentOpen && (
                <div className={styles.accentMenu}>
                  {accentPresets.map((preset) => (
                    <button
                      aria-current={
                        (preset.value || "") === accent ? "true" : undefined
                      }
                      className={styles.accentOption}
                      key={preset.name}
                      onClick={() => {
                        setAccent(preset.value);
                        syncUrl({ accent: preset.value });
                        setAccentOpen(false);
                      }}
                      type="button"
                    >
                      <span
                        aria-hidden="true"
                        className={`${styles.accentDot} ${
                          preset.value ? "" : styles.accentDotDefault
                        }`}
                        style={
                          preset.value
                            ? { background: preset.value }
                            : undefined
                        }
                      />
                      <span className={styles.accentOptionName}>
                        {preset.name}
                      </span>
                    </button>
                  ))}

                  {/*
                   * Custom. The wheel opens the platform picker; `onChange` fires as it is
                   * dragged, which is what makes the preview track live, while the URL is
                   * only rewritten on commit so dragging does not push a history entry per
                   * frame. The field beside it takes a hex directly, and carries the row on
                   * its own — an editable field reads as the way in more plainly than the
                   * word "Custom" sitting next to it did.
                   */}
                  <div
                    className={styles.accentCustom}
                    data-active={isCustomAccent}
                  >
                    <label className={styles.swatchPicker} title="Color wheel">
                      <span className={styles.visuallyHidden}>Color wheel</span>
                      <input
                        className={styles.swatchInput}
                        onBlur={() => syncUrl({})}
                        onChange={(e) => setAccent(e.target.value)}
                        type="color"
                        value={effectiveAccent}
                      />
                    </label>
                    <input
                      aria-label="Custom hex color"
                      className={styles.hexInput}
                      maxLength={7}
                      onBlur={() => {
                        if (!commitHex(hexDraft)) setHexDraft(accent);
                      }}
                      onChange={(e) => {
                        setHexDraft(e.target.value);
                        commitHex(e.target.value);
                      }}
                      placeholder={DEFAULT_ACCENT.toUpperCase()}
                      spellCheck={false}
                      value={hexDraft}
                    />
                  </div>
                </div>
              )}
            </div>
          </div>

          <p className={styles.environmentNote}>
            Clover easily and automatically uses the fonts and colors of your
            web app.
          </p>
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
            </div>
          </aside>
        </div>
      </div>
    </section>
  );
};

export default Playground;
