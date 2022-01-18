import React from "react";
import { NodeWebVttCueNested } from "hooks/use-webvtt";
import Cue from "components/Navigator/Cue";
import { MenuStyled } from "components/Navigator/Menu.styled";

interface MenuProps {
  currentTime: number;
  items: Array<NodeWebVttCueNested>;
}

const Menu: React.FC<MenuProps> = ({ currentTime, items }) => {
  return (
    <MenuStyled>
      {items.map(({ text, start, end, children: cueChildren, identifier }) => {
        const isCueActive: boolean = start <= currentTime && currentTime < end;

        return (
          <li key={identifier}>
            <Cue isActive={isCueActive} label={text} time={start} />
            {cueChildren && (
              <Menu currentTime={currentTime} items={cueChildren} />
            )}
          </li>
        );
      })}
    </MenuStyled>
  );
};

export default Menu;
