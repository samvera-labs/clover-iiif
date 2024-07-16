import { DataList, Link } from "@radix-ui/themes";

import React from "react";

interface PropertiesRightsProps {
  rights: string | null;
}

const PropertiesRights: React.FC<PropertiesRightsProps> = ({ rights }) => {
  if (!rights) return <></>;

  return (
    <DataList.Root orientation="vertical">
      <DataList.Item role="group">
        <DataList.Label>Rights</DataList.Label>
        <DataList.Value>
          <Link href={rights} target="_blank">
            {rights}
          </Link>
        </DataList.Value>
      </DataList.Item>
    </DataList.Root>
  );
};

export default PropertiesRights;
