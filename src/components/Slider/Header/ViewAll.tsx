import { Button } from "@radix-ui/themes";
import React from "react";

const ViewAll = (props) => {
  if (!props?.homepage && !props?.homepage[0]?.id) return null;

  const url = props.homepage[0].id;
  const handleClick = () => window.open(url, "_self");

  return (
    <Button data-url={url} onClick={handleClick}>
      View All
    </Button>
  );
};

export default ViewAll;
