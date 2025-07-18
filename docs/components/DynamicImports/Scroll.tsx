import { useEffect, useState } from "react";

import dynamic from "next/dynamic";
import { useRouter } from "next/router";

// todo: set this as a constant somewhere?
const defaultIiifContent =
  "https://iiif-maktaba.dc.library.northwestern.edu/dc8ff749-adad-42a7-81e0-0eb473ef88a5.json";

const Scroll = dynamic(() => import("src/components/Scroll"), {
  ssr: false,
});

const CloverScroll = ({
  iiifContent = defaultIiifContent,
  options,
}: {
  iiifContent: string;
  options;
}) => {
  const [iiifResource, setIiifResource] = useState<string>();

  const router = useRouter();
  const { "iiif-content": iiifContentParam } = router.query;

  useEffect(() => {
    iiifResource
      ? setIiifResource(iiifContentParam as string)
      : setIiifResource(iiifContent);
  }, [iiifContentParam]);

  if (!iiifResource) return null;

  return <Scroll iiifContent={iiifResource} options={options} />;
};

export default CloverScroll;
