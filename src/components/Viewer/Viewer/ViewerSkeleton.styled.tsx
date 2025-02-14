import { styled } from "src/styles/stitches.config";
import Skeleton from "src/components/UI/Skeleton/Skeleton";

const TitleSkeleton = styled(Skeleton, {
  margin: "1rem",
  width: "340px",
  height: "30px",
});

const ViewerContainer = styled("div", {
  display: "flex",
  flexDirection: "row",
});

const ViewerSkeletonWrapper = styled(Skeleton, {
  variants: {
    hasInformationPanel: {
      true: {
        width: "61.8%",
      },
      false: {
        width: "100%",
      },
    },
  },
  height: "500px",
  marginRight: "0.25rem",
});

const InformationPanel = styled("div", {
  display: "flex",
  flexDirection: "column",
  rowGap: "0.25rem",
  width: "38.2%",
  marginLeft: "0.25rem",
});

const TabSkeleton = styled(Skeleton, {
  width: "100%",
  height: "40px",
});

const TextContainer = styled("div", {
  padding: "1.618rem 0px",
  display: "flex",
  flexDirection: "column",
  rowGap: "0.5rem",
});

const TextSkeleton = styled(Skeleton, {
  height: "20px",
});

export {
  TitleSkeleton,
  ViewerContainer,
  ViewerSkeletonWrapper,
  InformationPanel,
  TabSkeleton,
  TextContainer,
  TextSkeleton,
};
