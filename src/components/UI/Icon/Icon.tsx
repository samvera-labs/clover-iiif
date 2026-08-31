import {
  Add,
  Audio,
  Close,
  Download,
  Image,
  PanelCollapse,
  PanelExpand,
  Video,
} from "src/components/UI/Icons";
import React from "react";

/**
 * Define SVG sub element <title>
 */
type TitleShape = {
  children: React.ReactNode;
};

const Title: React.FC<TitleShape> = ({ children }) => {
  return <title>{children}</title>;
};

/**
 * Define <svg>
 */

type IconShape = {
  children: React.ReactNode | React.ReactNode[];
};
interface IconComposition {
  Add: React.FC;
  Audio: React.FC;
  Close: React.FC;
  Download: React.FC;
  Image: React.FC;
  PanelCollapse: React.FC;
  PanelExpand: React.FC;
  Title: React.FC<TitleShape>;
  Video: React.FC;
}

type IconProps = React.SVGAttributes<SVGElement> &
  IconShape & {
    /** Renders at 1rem square. The only size the library ever asks for. */
    isSmall?: boolean;
  };

const Icon: React.FC<IconProps> & IconComposition = ({
  children,
  className,
  isSmall,
  ...attributes
}) => {
  return (
    <svg
      {...attributes}
      /*
       * The consumer's class is kept alongside Clover's rather than replacing it, so a
       * `className` passed in adds to the element instead of silently disabling its styles.
       */
      className={["clover-icon", className].filter(Boolean).join(" ")}
      data-size={isSmall ? "small" : undefined}
      data-testid="icon-svg"
      role="img"
      viewBox="0 0 512 512"
      xmlns="http://www.w3.org/2000/svg"
    >
      {children}
    </svg>
  );
};

/**
 * Title
 */
Icon.Title = Title;

/**
 * Path
 */
Icon.Add = Add;
Icon.Audio = Audio;
Icon.Close = Close;
Icon.Download = Download;
Icon.Image = Image;
Icon.PanelCollapse = PanelCollapse;
Icon.PanelExpand = PanelExpand;
Icon.Video = Video;

export { Icon };
