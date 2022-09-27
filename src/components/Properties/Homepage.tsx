import { Homepage } from "@samvera/nectar-iiif";
import { NectarExternalWebResource } from "@samvera/nectar-iiif/dist/types/nectar";
import React from "react";

interface PropertiesHomepageProps {
  homepage: NectarExternalWebResource[];
}

const PropertiesHomepage: React.FC<PropertiesHomepageProps> = ({
  homepage,
}) => {
  if (homepage?.length === 0) return <></>;

  return (
    <>
      <span className="manifest-property-title">Homepage</span>
      <Homepage homepage={homepage} />
    </>
  );
};

export default PropertiesHomepage;
