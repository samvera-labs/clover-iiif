import { NectarExternalWebResource } from "@samvera/nectar-iiif/dist/types/nectar";
import { SeeAlso } from "@samvera/nectar-iiif";
import React from "react";

interface PropertiesSeeAlsoProps {
  parent?: "manifest" | "canvas";
  seeAlso: NectarExternalWebResource[];
}

const PropertiesSeeAlso: React.FC<PropertiesSeeAlsoProps> = ({
  parent = "manifest",
  seeAlso,
}) => {
  if (seeAlso?.length === 0) return <></>;

  return (
    <>
      <label
        className="manifest-property-title"
        htmlFor={`iiif-${parent}-see-also`}
      >
        See Also
      </label>
      <SeeAlso seeAlso={seeAlso} id={`iiif-${parent}-see-also`} />
    </>
  );
};

export default PropertiesSeeAlso;
