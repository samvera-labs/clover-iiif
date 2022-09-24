import { Homepage } from "@samvera/nectar-iiif";
import { NectarExternalWebResource } from "@samvera/nectar-iiif/dist/types/nectar";
import React from "react";

interface PropertiesHomepageProps {
  homepage: NectarExternalWebResource[];
  parent?: "manifest" | "canvas";
}

const PropertiesHomepage: React.FC<PropertiesHomepageProps> = ({
  homepage,
  parent = "manifest",
}) => {
  if (homepage?.length === 0) return <></>;

  return (
    <>
      <label
        className="manifest-property-title"
        htmlFor={`iiif-${parent}-see-also`}
      >
        Homepage
      </label>
      <Homepage homepage={homepage} id={`iiif-${parent}-see-also`} />
    </>
  );
};

export default PropertiesHomepage;
