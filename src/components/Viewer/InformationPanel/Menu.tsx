import Cue from "src/components/Viewer/InformationPanel/Annotation/VTT/Cue";
import { MenuStyled } from "src/components/Viewer/InformationPanel/Menu.styled";
import { NodeWebVttCueNested } from "src/hooks/use-webvtt";
import React from "react";

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
