import { PrimitivesExternalWebResource } from "src/types/primitives";
import { Rendering } from "src/components/Primitives";
import React from "react";

interface PropertiesRenderingProps {
  rendering: PrimitivesExternalWebResource[];
}

const PropertiesRendering: React.FC<PropertiesRenderingProps> = ({
  rendering,
}) => {
  if (rendering?.length === 0) return <></>;

  return (
    <>
      <span className="manifest-property-title">Alternate formats</span>
      <Rendering rendering={rendering} />
    </>
  );
};

export default PropertiesRendering;
