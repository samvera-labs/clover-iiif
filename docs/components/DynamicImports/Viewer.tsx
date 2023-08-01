import dynamic from "next/dynamic";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";

const defaultManifest =
  "https://api.dc.library.northwestern.edu/api/v2/works/ad25d4af-8a12-4d8f-a557-79aea012e081?as=iiif";

const Viewer = dynamic(() => import("src/components/Viewer"), {
  ssr: false,
});

const CloverViewer = ({
  id = defaultManifest,
  options,
}: {
  id: string;
  options?: any;
}) => {
  const [iiifContent, setIiifContent] = useState<string>();
  const router = useRouter();
  const { "iiif-content": iiifContentParam } = router.query;

  useEffect(() => {
    iiifContent
      ? setIiifContent(iiifContentParam as string)
      : setIiifContent(id);
  }, [iiifContentParam]);

  if (!iiifContent) return <></>;

  return <Viewer id={iiifContent} options={options} key={iiifContent} />;
};

export default CloverViewer;
