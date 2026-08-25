import { useEffect, useState } from "react";

import Slider from "src/components/Slider";
import { type CloverSliderProps } from "src/components/Slider";
import { demoResources } from "docs/lib/demo-resources";
import { useRouter } from "next/router";

/**
 * Forwards every Slider prop rather than naming a few.
 *
 * The playground turns the embedding seams — `showHeader`, `presentational`, `align`,
 * `dragFree`, `slidesToScroll` — and an allow-list here would drop them silently, which
 * reads as the controls doing nothing.
 */
const CloverSlider = ({
  iiifContent = demoResources.slider,
  ...props
}: Omit<CloverSliderProps, "iiifContent"> & { iiifContent?: string }) => {
  const [iiifResource, setIiifResource] = useState<string>();

  const router = useRouter();
  const { "iiif-content": iiifContentParam } = router.query;

  useEffect(() => {
    iiifResource
      ? setIiifResource(iiifContentParam as string)
      : setIiifResource(iiifContent);
  }, [iiifContentParam]);

  if (!iiifResource) return <></>;

  return <Slider {...props} iiifContent={iiifResource} key={iiifContent} />;
};

export default CloverSlider;
