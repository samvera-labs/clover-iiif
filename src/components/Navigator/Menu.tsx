import React from "react";
import { NodeWebVttCueNested } from "@/hooks/use-webvtt";
import Cue from "@/components/Navigator/Cue";
import { MenuStyled } from "@/components/Navigator/Menu.styled";

interface MenuProps {
  items: Array<NodeWebVttCueNested>;
}
const Menu: React.FC<MenuProps> = ({ items }) => {
  return (
    <MenuStyled>
      {items.map((item) => {
        const { text, start, end, children, identifier } = item;
        return (
          <li key={identifier}>
            <Cue label={text} start={start} end={end} />
            {children && <Menu items={children} />}
          </li>
        );
      })}
    </MenuStyled>
  );
};
export default Menu;
