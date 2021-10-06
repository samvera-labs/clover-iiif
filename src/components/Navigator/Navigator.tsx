import React from "react";
import { styled } from "@stitches/react";
import NavigatorItem from "components/Navigator/NavigatorItem";
import sampleParsedVtt from "samples/sampleParsedVtt.json";

interface NavigatorProps {
  currentTime: number;
  tracks?: {};
}
interface NavigatorTabProps {
  label: string;
  active: boolean;
}

export const Navigator: React.FC<NavigatorProps> = ({ currentTime }) => {
  return (
    <NavigatorWrapper data-testid="navigator-wrapper">
      <NavigatorHeader>
        <NavigatorTab label="Camptium" active={true} />
        <NavigatorTab label="Mauris" active={false} />
        <NavigatorTab label="Tristique" active={false} />
      </NavigatorHeader>
      <NavigatorBody>
        <NavigatorOutput>
          <NavigatorBodyInner
            items={sampleParsedVtt.output}
            currentTime={currentTime}
          />
        </NavigatorOutput>
      </NavigatorBody>
    </NavigatorWrapper>
  );
};

const NavigatorTab: React.FC<NavigatorTabProps> = ({ label }) => {
  return <NavigatorTabWrapper>{label}</NavigatorTabWrapper>;
};

interface Cue {
  id: number;
  startTime: string;
  endTime: string;
  text: string;
}

interface NavigatorBodyInnerProps {
  currentTime: number;
  items: Cue[];
}

const NavigatorBodyInner: React.FC<NavigatorBodyInnerProps> = ({
  items,
  currentTime,
}) => {
  return (
    <>
      {items.map(({ id, text, startTime }) => (
        <NavigatorItem
          label={text}
          startTime={startTime}
          t={currentTime}
          key={id}
        />
      ))}
    </>
  );
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
  padding: "0 1.618rem 1.618rem",
});

const NavigatorBody = styled("div", {
  display: "flex",
  flexGrow: "1",
  flexShrink: "0",
  position: "relative",

  "&::after": {
    content: "",
    marginLeft: "-5px",
    width: "calc(100% + 5px)",
    height: "1.618rem",
    backgroundImage: `linear-gradient(0deg, #FFFFFF 0%, #FFFFFF00 100%)`,
    position: "absolute",
    bottom: "0",
  },

  [`& ${NavigatorBodyInner}`]: {
    position: "absolute",
    overflowY: "scroll",
    height: "100%",
    width: "100%",
  },
});

const NavigatorOutput = styled("div", {
  position: "absolute",
  overflowY: "scroll",
  height: "100%",
  width: "100%",
});

const NavigatorTabWrapper = styled("button", {
  display: "flex",
  padding: "0.618rem 1rem",
  background: "none",
  backgroundColor: "#4e2a84",
  color: "#fff",
  border: "none",
  fontFamily: "inherit",
  fontSize: "1rem",
  textTransform: "uppercase",
  marginRight: "1rem",
  whiteSpace: "nowrap",
});

export default Navigator;
