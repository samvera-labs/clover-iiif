import {
  CollectionItems,
  CollectionNormalized,
  ContentResource,
  InternationalString,
} from "@iiif/presentation-3";
import {
  CollectionProvider,
  defaultState,
  useCollectionState,
} from "src/context/slider-context";
import {
  type ConfigOptions,
  type SliderItem,
  type SliderPager,
} from "src/types/slider";
import {
  type SliderBehavior,
  groupItemsByBehavior,
  resolveBehavior,
} from "src/components/Slider/behavior";
import React, { useEffect, useMemo, useState } from "react";

import { ErrorBoundary } from "react-error-boundary";
import ErrorFallback from "src/components/Slider/ErrorFallback/ErrorFallback";
import Header from "src/components/Slider/Header/Header";
import Items from "src/components/Slider/Items/Items";
import { Wrapper } from "src/components/Slider/Slider.styled";
import { getLabelAsString } from "src/lib/label-helpers";
import useBreakpoints from "src/components/Slider/useBreakpoints";
import useTrack from "src/components/Shared/Track/useTrack";
import { upgrade } from "@iiif/parser/upgrader";

export interface CloverSliderProps {
  collectionId?: string;
  /**
   * A IIIF Collection URL to fetch. Optional when `items` is supplied.
   */
  iiifContent?: string;
  /**
   * An already-resolved Presentation API `items` array, rendered as-is with no fetch.
   *
   * This is what lets the Slider serve as a general-purpose strip for any list of IIIF
   * resources — the members of a Collection, but equally a set of annotations — and what
   * lets other components embed it rather than reimplementing a thumbnail carousel.
   * When present it wins over `iiifContent`.
   */
  items?: unknown[];
  /** Heading text, for use with `items` where there is no Collection to read it from. */
  label?: InternationalString;
  onItemInteraction?: (item: SliderItem) => void;
  options?: ConfigOptions;
  /** Sub-heading text, for use with `items`. */
  summary?: InternationalString;

  /**
   * IIIF layout behavior, overriding whatever the resource declares.
   *
   * Left unset, the Slider reads `behavior` off the fetched resource and falls back to
   * `individuals` — the spec's default. `paged` groups items into spreads, opening on a
   * lone cover; `continuous` closes the gutter so the sequence reads as one object.
   *
   * Only ever inferred from a *fetched* resource: `items` arrives without the resource
   * that declared anything, so pass this alongside it.
   */
  behavior?: SliderBehavior;

  /* ---- Seams for embedding the Slider inside another component ---- */

  /**
   * Index to bring into view. Changing it scrolls the track, which is how a host keeps
   * its own selection visible — the Viewer centres the active canvas this way.
   */
  activeIndex?: number;
  /** Where a scrolled-to slide rests. Defaults to `center`. */
  align?: "start" | "center" | "end";
  /** Free scrolling rather than snapping to slide boundaries. */
  dragFree?: boolean;
  /**
   * Render a slide's contents, replacing the default linked figure. This is what lets the
   * Slider carry something other than Collection members — a radio-selectable canvas, or
   * a paged group of them — while still owning the carousel.
   */
  renderItem?: (item: unknown, index: number) => React.ReactNode;
  /**
   * Drop the carousel ARIA so an embedding component can own the semantics. Required when
   * the rail lives inside another widget role, such as the Viewer's radio group.
   */
  presentational?: boolean;
  /** Hide the label/summary/controls header when the host supplies its own. */
  showHeader?: boolean;
  /**
   * Render a filter control in the header.
   *
   * Without `onSearch` the Slider narrows its own `items` by label. With one it reports the
   * query and filters nothing — the host hands back a shorter list, which is all the
   * carousel needs in order to re-measure. The Viewer takes that path: its slides are paged
   * groups with no label of their own, so only it can tell what a query matches.
   */
  search?: boolean;
  /** Receives the filter query, taking the filtering over from the Slider. */
  onSearch?: (query: string) => void;
  /**
   * A position in the host's own sequence. Supplying it shows a counter in the header and
   * hands the arrows over to `onStep`, so they move the host's selection rather than the
   * rail.
   */
  pager?: SliderPager;
  /** Right-to-left control order, for a paged resource read that way. */
  isRtl?: boolean;
  /**
   * Wraps the slides, so a host can own the region's semantics without also enclosing the
   * header. The Viewer's radio group has to be an ancestor of its thumbnails but must not
   * contain the header's buttons and filter field, which are not radios.
   */
  wrapItems?: (items: React.ReactNode) => React.ReactNode;
  /**
   * Slides per snap point. Defaults to the breakpoint's group size, which is what a
   * Collection carousel wants. A selection rail passes 1 so `activeIndex` addresses a
   * slide rather than a group of them.
   */
  slidesToScroll?: number | "auto";
}

const CloverSlider: React.FC<CloverSliderProps> = (props) => {
  return (
    <CollectionProvider
      initialState={{
        ...defaultState,
        options: { ...props.options },
      }}
    >
      <RenderSlider {...props} />
    </CollectionProvider>
  );
};

const RenderSlider: React.FC<CloverSliderProps> = ({
  activeIndex,
  align = "center",
  behavior: behaviorOverride,
  collectionId,
  dragFree = false,
  iiifContent,
  isRtl = false,
  items: providedItems,
  label: providedLabel,
  onItemInteraction,
  onSearch,
  pager,
  presentational = false,
  renderItem,
  search = false,
  showHeader = true,
  slidesToScroll,
  summary: providedSummary,
  wrapItems,
}) => {
  const store = useCollectionState();
  const { options } = store;
  const [collection, setCollection] = useState<CollectionNormalized>();

  /** With `items` in hand there is nothing to fetch. */
  const isProvided = Boolean(providedItems);

  let iiifResource = iiifContent;
  if (collectionId) iiifResource = collectionId;

  useEffect(() => {
    if (isProvided || !iiifResource) return;
    fetch(iiifResource)
      .then((response) => response.json())
      .then(upgrade)
      .then((data: any) => setCollection(data))
      .catch((error: any) => {
        console.error(
          `The IIIF Collection ${iiifResource} failed to load: ${error}`,
        );
      });
  }, [iiifResource, isProvided]);

  const resolvedItems: unknown[] | undefined =
    providedItems ?? (collection?.items as CollectionItems[] | undefined);

  /*
   * The filter query, held here only when the Slider is the one filtering.
   *
   * A host that passes `onSearch` narrows its own list and hands back a shorter `items`, so
   * the Slider must not narrow it a second time — it would be matching a query against
   * whatever opaque objects the host chose to put in the list.
   */
  const [query, setQuery] = useState<string>("");
  const ownsFiltering = search && !onSearch;

  const handleSearch = (value: string) => {
    if (ownsFiltering) setQuery(value);
    onSearch?.(value);
  };

  const items = useMemo(() => {
    if (!ownsFiltering || !query || !resolvedItems) return resolvedItems;
    const needle = query.toLowerCase();
    return resolvedItems.filter((item) => {
      const label = getLabelAsString((item as any)?.label) || "";
      return label.toLowerCase().includes(needle);
    });
  }, [ownsFiltering, query, resolvedItems]);

  /*
   * `collection` is undefined while a fetch is in flight and always undefined when the
   * caller passed `items`, so the declared behavior is simply absent in both cases and the
   * resolver falls through to its default.
   */
  const behavior = resolveBehavior(
    (collection as { behavior?: unknown } | undefined)?.behavior,
    behaviorOverride,
  );
  const slides = useMemo(
    () => groupItemsByBehavior(items ?? [], behavior),
    [items, behavior],
  );

  const config = useBreakpoints(options.breakpoints);
  /*
   * The track is owned here, not in `Items`, because the prev/next controls live in
   * `Header` — a sibling. Holding it at the common parent is what removed the old
   * cross-component `document.querySelector` wiring.
   */
  const track = useTrack({
    align,
    dragFree,
    itemCount: slides.length,
    /*
     * Page by what fits, and centre it.
     *
     * A fixed group count was jumping well past the visible run: slides are sized by
     * their own content now, so a count taken from the viewport width cannot know how
     * many are actually on screen, and `align: "start"` then pushed the target to the
     * edge on top of that. `"auto"` lets Embla group by what the viewport holds, and
     * centring lands that group in view rather than flush against a side.
     */
    slidesToScroll: slidesToScroll ?? config.slidesPerGroup ?? "auto",
  });

  /*
   * Keep the host's selection centred, on every change.
   *
   * An earlier version only scrolled once the active slide had left the viewport, which
   * moved the rail less but left the selection drifting toward an edge before snapping
   * back. Centring unconditionally keeps its position meaningful: wherever you are in a
   * long sequence, the current item is the middle one.
   *
   * `containScroll: "trimSnaps"` still clamps the ends, so the first and last few slides
   * sit off-centre rather than being pulled in with empty space beside them.
   *
   * Guarded on `activeIndex` being supplied, so a plain Collection carousel is never
   * scrolled out from under the reader.
   */
  useEffect(() => {
    if (typeof activeIndex !== "number" || activeIndex < 0) return;
    track.scrollToIndex(activeIndex);
  }, [activeIndex, track.scrollToIndex]);

  /*
   * Bail out only on a fetched Collection that genuinely holds nothing.
   *
   * Two things made the old unconditional bail wrong once the header moved in here. A
   * filter that matches nothing should empty the rail, not unmount the field the reader is
   * still typing in — hence keying on what the resource held rather than on what the filter
   * left. And a host that passed `items` has already decided to mount the Slider: the
   * Viewer's list is briefly empty while it resolves which canvases carry a painting, and
   * disappearing for that frame took the whole control surface with it.
   */
  if (!isProvided && resolvedItems && resolvedItems.length === 0) {
    console.log(`The IIIF Collection ${iiifResource} does not contain items.`);
    return <></>;
  }

  const homepage: ContentResource[] = options.customViewAll
    ? [
        {
          id: options.customViewAll,
          type: "Text",
          format: "text/html",
        },
      ]
    : (collection?.homepage as any as ContentResource[]);

  if (!resolvedItems) return <></>;

  const label = (providedLabel ??
    collection?.label ?? { none: [""] }) as InternationalString;
  const summary = (providedSummary ??
    collection?.summary ?? { none: [""] }) as InternationalString;

  const renderItems = wrapItems ?? ((children: React.ReactNode) => children);

  return (
    <Wrapper className="clover-slider" data-testid="clover-slider">
      <ErrorBoundary FallbackComponent={ErrorFallback}>
        {showHeader && (
          <Header
            canScrollNext={track.canScrollNext}
            canScrollPrev={track.canScrollPrev}
            homepage={homepage}
            isRtl={isRtl}
            label={label}
            onScrollNext={track.scrollNext}
            onScrollPrev={track.scrollPrev}
            onSearch={search ? handleSearch : undefined}
            pager={pager}
            search={search}
            summary={summary}
          />
        )}
        {renderItems(
          <Items
            config={config}
            handleItemInteraction={onItemInteraction}
            presentational={presentational}
            renderItem={renderItem}
            seamless={behavior === "continuous"}
            slides={slides}
            track={track}
          />,
        )}
      </ErrorBoundary>
    </Wrapper>
  );
};

export default CloverSlider;
