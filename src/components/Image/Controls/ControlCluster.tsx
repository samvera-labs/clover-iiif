import React, { useState } from "react";

import Button from "src/components/Image/Controls/Button";
import { ControlIcon } from "src/components/Image/Controls/glyphs";
import type { ControlButtons } from "src/context/viewer-context";
import useWithinFullscreen from "src/hooks/useWithinFullscreen";

export interface ControlSpec {
  key: keyof ControlButtons;
  /** `<key>-<instance>`: `Button` derives its `data-button` from the prefix. */
  id: string;
  label: string;
  glyph: React.ReactElement;
  /** Absent for a control OpenSeadragon binds by id. */
  onClick?: React.MouseEventHandler<HTMLButtonElement>;
  /** For a control that opens a menu: whether it is open, and the menu's id. */
  expanded?: boolean;
  controls?: string;
}

export interface ControlClusterProps {
  /**
   * The controls to render, given whether the cluster sits inside whatever is full
   * screen — so the full-screen control can name and draw the way out.
   */
  controls: (isFullscreen: boolean) => ControlSpec[];
  /** Consumer replacements, keyed like `ControlSpec.key`. */
  controlButtons?: ControlButtons;
  hasPlaceholder?: boolean;
  hasInformationToggle?: boolean;
  isPanelOpen?: boolean;
  /** Rendered after the controls: plugin controls, in a `Viewer`. */
  children?: React.ReactNode;
}

/**
 * The zoom, full-screen, rotate and reset cluster over an image: its markup, its layout
 * hooks, and the `controlButtons` replacement contract — and nothing else.
 *
 * Presentational on purpose. `Image` wraps it with the Viewer context and OpenSeadragon's
 * id binding; `Canvas` hands it click handlers directly, so a standalone `Canvas` does not
 * carry the Viewer context.
 */
const ControlCluster: React.FC<ControlClusterProps> = ({
  controls,
  controlButtons,
  hasPlaceholder = false,
  hasInformationToggle = false,
  isPanelOpen = false,
  children,
}) => {
  /*
   * Whether these controls are inside whatever is full screen.
   *
   * Containment rather than identity, because the control cannot know which root the browser
   * put in full screen: the `Viewer`'s when nested, the image's own wrapper when standalone.
   */
  const [element, setElement] = useState<HTMLDivElement | null>(null);
  const isFullscreen = useWithinFullscreen(element);

  /**
   * Renders a consumer's control in place of the default when one is configured.
   * The replacement owns the element, so it is handed props to spread rather than
   * being told what to render: OpenSeadragon binds by element id, and the
   * accessible name has to survive whatever markup the consumer chooses.
   */
  function renderControl({
    key,
    id,
    label,
    glyph,
    onClick,
    expanded,
    controls,
  }: ControlSpec) {
    const Custom = controlButtons?.[key];
    if (Custom)
      return (
        <Custom
          key={key}
          buttonProps={{
            id,
            type: "button",
            "aria-label": label,
            onClick,
            ...(expanded !== undefined && {
              "aria-expanded": expanded,
              "aria-controls": controls,
            }),
          }}
          icon={<ControlIcon label={label}>{glyph}</ControlIcon>}
          label={label}
        />
      );
    return (
      <Button
        key={key}
        id={id}
        label={label}
        onClick={onClick}
        expanded={expanded}
        controls={controls}
      >
        {glyph}
      </Button>
    );
  }

  return (
    <div
      className="clover-iiif-image-openseadragon-controls"
      data-fullscreen={isFullscreen}
      data-has-information-toggle={hasInformationToggle}
      data-has-placeholder={hasPlaceholder}
      data-panel-open={isPanelOpen}
      data-testid="clover-iiif-image-openseadragon-controls"
      ref={setElement}
    >
      {controls(isFullscreen).map(renderControl)}
      {children}
    </div>
  );
};

export default ControlCluster;
