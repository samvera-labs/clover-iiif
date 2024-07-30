import { DataList } from "@radix-ui/themes";
import { PrimitivesExternalWebResource } from "src/types/primitives";
import React from "react";
import { Rendering } from "src/components/Primitives";

interface PropertiesRenderingProps {
  rendering: PrimitivesExternalWebResource[];
}

const PropertiesRendering: React.FC<PropertiesRenderingProps> = ({
  rendering,
}) => {
  if (rendering?.length === 0) return <></>;

  return (
    <DataList.Root orientation="vertical" size="3">
      <DataList.Item role="group">
        <DataList.Label>Alternate formats</DataList.Label>
        <DataList.Value>
          <Rendering rendering={rendering} />
        </DataList.Value>
      </DataList.Item>
    </DataList.Root>
  );
};

export default PropertiesRendering;
