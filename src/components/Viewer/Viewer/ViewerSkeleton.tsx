import { ViewerConfigOptions } from "src/context/viewer-context";
import {
  TitleSkeleton,
  ViewerContainer,
  ViewerSkeletonWrapper,
  InformationPanel,
  TabSkeleton,
  TextContainer,
  TextSkeleton,
} from "./ViewerSkeleton.styled";

export interface ViewerSkeletonProps {
  options: ViewerConfigOptions | undefined;
}

const ViewerSkeleton: React.FC<ViewerSkeletonProps> = ({ options }) => {
  return (
    <>
      {/* Title */}
      <TitleSkeleton />

      <ViewerContainer>
        {/* Viewer */}
        <ViewerSkeletonWrapper
          hasInformationPanel={!!options?.informationPanel?.open}
          css={{ height: options?.canvasHeight || "500px" }}
        />

        {/* Information Panel */}
        {!!options?.informationPanel?.open && (
          <InformationPanel>
            {/* Tab */}
            <TabSkeleton />

            {/* Text */}
            <TextContainer>
              <TextSkeleton />
              <TextSkeleton />
              <TextSkeleton />
              <TextSkeleton />
              <TextSkeleton />
              <TextSkeleton />
            </TextContainer>
          </InformationPanel>
        )}
      </ViewerContainer>
    </>
  );
};

export default ViewerSkeleton;
