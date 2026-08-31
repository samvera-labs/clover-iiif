import React from "react";

interface PlaceholderProps {
  backgroundImage: string;
}

/**
 * What sits behind a slide's thumbnail until it loads.
 *
 * Its box has to be the thumbnail's box. It used to fix its own 1:1 ratio with a Radix
 * `AspectRatio.Root`, which was invisible while the card was always square — and became a
 * grey band hanging below the image the moment `--clover-thumbnail-height` could shorten it.
 * It follows the same rule as the image box now.
 */
const Placeholder: React.FC<PlaceholderProps> = ({ backgroundImage }) => {
  return (
    <div
      className="clover-slider-item-placeholder"
      data-testid="slider-item-placeholder"
    >
      <div
        className="clover-slider-item-placeholder-image"
        style={{ backgroundImage: `url(${backgroundImage})` }}
      />
    </div>
  );
};

export default Placeholder;
