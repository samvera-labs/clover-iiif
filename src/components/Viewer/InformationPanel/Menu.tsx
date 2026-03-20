import Cue from "src/components/Viewer/InformationPanel/Annotation/VTT/Cue";
import { NodeWebVttCueNested } from "src/hooks/use-webvtt";
import React from "react";
import { menuList } from "./Menu.css";

interface MenuProps {
  items: Array<NodeWebVttCueNested>;
}
const Menu: React.FC<MenuProps> = ({ items }) => {
  return (
    <ul className={menuList}>
      {items.map((item) => {
        const { html, text, start, end, children, identifier } = item;
        return (
          <li key={identifier}>
            <Cue html={html} text={text} start={start} end={end} />
            {children && <Menu items={children} />}
          </li>
        );
      })}
    </ul>
  );
};
export default Menu;
