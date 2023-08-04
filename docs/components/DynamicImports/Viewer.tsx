import { useEffect, useState } from "react";

import dynamic from "next/dynamic";
import { useRouter } from "next/router";

// todo: set this as a constant somewhere?
const defaultIiifContent =
  "https://api.dc.library.northwestern.edu/api/v2/works/71153379-4283-43be-8b0f-4e7e3bfda275?as=iiif";

const Viewer = dynamic(() => import("src").then((Clover) => Clover.Viewer), {
  ssr: false,
});

const CloverViewer = ({
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
    <Viewer iiifContent={iiifResource} options={options} key={iiifContent} />
  );
};

export default CloverViewer;
