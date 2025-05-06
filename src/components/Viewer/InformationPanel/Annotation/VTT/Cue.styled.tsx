import * as RadioGroup from "@radix-ui/react-radio-group";

import { annotationItemRow } from "src/components/Viewer/InformationPanel/Annotation/Item.styled";
import { styled } from "src/styles/stitches.config";

export const Group = styled(RadioGroup.Root, {
  display: "flex",
  flexDirection: "column",
  width: "100%",
});

export const Item = styled(RadioGroup.Item, {
  ...annotationItemRow,
  justifyContent: "space-between",
  textAlign: "left",
  flexGrow: 1,
  margin: 0,
  padding: "0.618rem 1rem",
  width: "100%",
  fontSize: "1rem",

  strong: {
    marginLeft: "1rem",
  },

  "&:hover": {
    color: "$accent",
  },

  "&[aria-checked='true']": {
    background: "#6662",
  },
});
