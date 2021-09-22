import React, { useEffect, useState } from "react";
import { styled } from "@stitches/react";
import NavigatorItem from "components/NavigatorItem/NavigatorItem";

interface NavigatorProps {
  currentTime: number;
  tracks: object;
}
interface NavigatorTabProps {
  label: string;
  active: boolean;
}

export const Navigator: React.FC<NavigatorProps> = ({ currentTime }) => {
  return (
    <NavigatorWrapper>
      <NavigatorHeader>
        <NavigatorTab label="Camptium" active={true} />
        <NavigatorTab label="Mauris varius" active={false} />
        <NavigatorTab label="Tristique" active={false} />
      </NavigatorHeader>
      <NavigatorBody>
        <NavigatorBodyInner>
          <NavigatorItem label="" time="" t={0} />
          <NavigatorItem label="" time="" t={0} />
          <NavigatorItem label="" time="" t={0} />
          <NavigatorItem label="" time="" t={0} />
          <NavigatorItem label="" time="" t={0} />
          <NavigatorItem label="" time="" t={0} />
          <NavigatorItem label="" time="" t={0} />
          <NavigatorItem label="" time="" t={0} />
          <NavigatorItem label="" time="" t={0} />
          <NavigatorItem label="" time="" t={0} />
          <NavigatorItem label="" time="" t={0} />
          <NavigatorItem label="" time="" t={0} />
          <NavigatorItem label="" time="" t={0} />
          <NavigatorItem label="" time="" t={0} />
          <NavigatorItem label="" time="" t={0} />
          <NavigatorItem label="" time="" t={0} />
          <NavigatorItem label="" time="" t={0} />
          <NavigatorItem label="" time="" t={0} />
          <NavigatorItem label="" time="" t={0} />
          <NavigatorItem label="" time="" t={0} />
          <NavigatorItem label="" time="" t={0} />
          <NavigatorItem label="" time="" t={0} />
          <NavigatorItem label="" time="" t={0} />
          <NavigatorItem label="" time="" t={0} />
          <NavigatorItem label="" time="" t={0} />
          <NavigatorItem label="" time="" t={0} />
          <NavigatorItem label="" time="" t={0} />
          <NavigatorItem label="" time="" t={0} />
          <NavigatorItem label="" time="" t={0} />
          <NavigatorItem label="" time="" t={0} />
          <NavigatorItem label="" time="" t={0} />
          <NavigatorItem label="" time="" t={0} />
          <NavigatorItem label="" time="" t={0} />
          <NavigatorItem label="" time="" t={0} />
        </NavigatorBodyInner>
      </NavigatorBody>
    </NavigatorWrapper>
  );
};

const NavigatorTab: React.FC<NavigatorTabProps> = ({ label }) => {
  return <NavigatorTabWrapper>{label}</NavigatorTabWrapper>;
};

const NavigatorWrapper = styled("div", {
  display: "flex",
  flexDirection: "column",
  width: "100%",
  height: "100%",
  flexGrow: "1",
  flexShrink: "0",
  position: "relative",
  zIndex: "1",
  boxShadow: "-5px 0 5px #00000011",
});

const NavigatorHeader = styled("header", {
  display: "flex",
  flexGrow: "0",
  padding: "0 1rem 1rem",
});

const NavigatorBody = styled("div", {
  display: "flex",
  flexGrow: "1",
  flexShrink: "0",
  position: "relative",
});

const NavigatorBodyInner = styled("nav", {
  position: "absolute",
  overflowY: "scroll",
  height: "100%",
  width: "100%",
});

const NavigatorTabWrapper = styled("button", {
  display: "flex",
  padding: "1rem",
  background: "none",
  backgroundColor: "lightGray",
  border: "none",
  fontFamily: "inherit",
  fontSize: "1rem",
  marginRight: "1rem",
});

export default Navigator;
