import { useEffect, useState } from "react";

import Slider from "src/components/Slider";
import { useRouter } from "next/router";

// todo: set this as a constant somewhere?
const defaultIiifContent =
  "https://api.dc.library.northwestern.edu/api/v2/works/3807023b-76b7-4062-9e40-d63ebc8945a9/similar?as=iiif&collectionLabel=More+Like+This&collectionSummary=Similar+to+Johnny+Rivers%2C+Monterey+Pop+Festival";

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
