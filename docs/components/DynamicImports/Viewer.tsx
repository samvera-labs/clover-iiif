import dynamic from "next/dynamic";
import { useRouter } from "next/router";

// todo: set this as a constant somewhere?
const defaultIiifContent =
  "https://api.dc.library.northwestern.edu/api/v2/works/71153379-4283-43be-8b0f-4e7e3bfda275?as=iiif";

const Viewer = dynamic(() => import("src/components/Viewer"), {
  ssr: false,
});

const CloverViewer = ({
  iiifContent = defaultIiifContent,
  options,
}: {
  iiifContent: string;
  options?: any;
}) => {
  const router = useRouter();
  const iiifResource = router.query["iiif-content"]
    ? (router.query["iiif-content"] as string)
    : iiifContent;

  return (
    <Viewer iiifContent={iiifResource} options={options} key={iiifContent} />
  );
};

export default CloverViewer;
