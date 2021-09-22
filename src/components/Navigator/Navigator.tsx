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
      <header>
        <NavigatorTab label="Camptium" active={true} />
        <NavigatorTab label="Mauris varius" active={false} />
        <NavigatorTab label="Tristique" active={false} />
      </header>
      <nav>
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
      </nav>
    </NavigatorWrapper>
  );
};

const NavigatorTab: React.FC<NavigatorTabProps> = ({ label }) => {
  return <NavigatorTabWrapper>{label}</NavigatorTabWrapper>;
};

const NavigatorWrapper = styled("div", {
  width: "100%",
  height: "100%",
  flexGrow: "1",
  flexShrink: "0",
  position: "relative",
  zIndex: "1",
  boxShadow: "-5px 0 5px #00000011",
});

const NavigatorTabWrapper = styled("button", {
  padding: "0.618rem",
});

export default Navigator;
