import { NectarExternalWebResource } from "@samvera/nectar-iiif/dist/types/nectar";
import { SeeAlso } from "@samvera/nectar-iiif";
import React from "react";

interface AboutSeeAlsoProps {
  parent?: "manifest" | "canvas";
  seeAlso: NectarExternalWebResource[];
}

const AboutSeeAlso: React.FC<AboutSeeAlsoProps> = ({
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
      <SeeAlso
        seeAlso={seeAlso as unknown as NectarExternalWebResource[]}
        id={`iiif-${parent}-see-also`}
      />
    </>
  );
};

export default AboutSeeAlso;
