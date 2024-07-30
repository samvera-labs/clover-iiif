import { Flex, Switch, Text } from "@radix-ui/themes";
import React, { useEffect, useState } from "react";
import { useViewerDispatch, useViewerState } from "src/context/viewer-context";

const Toggle = () => {
  const { configOptions } = useViewerState();
  const dispatch: any = useViewerDispatch();

  const [checked, setChecked] = useState(configOptions?.informationPanel?.open);

  useEffect(() => {
    dispatch({
      type: "updateInformationOpen",
      isInformationOpen: checked,
    });
  }, [checked, dispatch]);

  return (
    <Text as="label" size="2">
      <Flex gap="2">
        Information
        <Switch
          size="3"
          checked={checked}
          onCheckedChange={() => setChecked(!checked)}
        />
      </Flex>
    </Text>
  );
};

export default Toggle;
