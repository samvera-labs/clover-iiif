import { useEffect, useState } from "react";

import dynamic from "next/dynamic";
import { useRouter } from "next/router";

// todo: set this as a constant somewhere?
const defaultIiifContent =
  "https://api.dc.library.northwestern.edu/api/v2/works/ad25d4af-8a12-4d8f-a557-79aea012e081?as=iiif";

const Slider = dynamic(() => import("src").then((Clover) => Clover.Slider), {
  ssr: false,
});

const CloverSlider = ({
  iiifContent = defaultIiifContent,
  options,
}: {
  iiifContent: string;
  options?: any;
}) => {
  const [iiifResource, setIiifResource] = useState<string>();

  const router = useRouter();
  const { "iiif-content": iiifContentParam } = router.query;

  useEffect(() => {
    iiifResource
      ? setIiifResource(iiifContentParam as string)
      : setIiifResource(iiifContent);
  }, [iiifContentParam]);

  if (!iiifResource) return <></>;

  return (
    <Slider iiifContent={iiifResource} options={options} key={iiifContent} />
  );
};

export default CloverSlider;
