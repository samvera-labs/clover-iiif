import { Popover } from "src/components/UI";
import { PopoverContent } from "./Header.styled";
import { styled } from "src/styles/stitches.config";

const DownloadButton = styled(Popover.Trigger, {
  width: "30px",
  padding: "5px",
});

const DownloadContent = styled(PopoverContent, {
  h3: {
    color: "$primaryAlt",
    fontSize: "$2",
    fontWeight: "700",
    margin: "$2 0",
  },

  button: {},

  "& ul li": {
    marginBottom: "$1",
  },
});

export { DownloadButton, DownloadContent };
