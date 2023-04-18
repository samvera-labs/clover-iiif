import React, { useEffect, useState } from "react";
import { Item } from "@/components/Navigator/Cue.styled";
import { convertTime } from "@/services/utils";

interface Props {
  label: string;
  start: number;
  end: number;
}

const Cue: React.FC<Props> = ({ label, start, end }) => {
  const [isActive, updateIsActive] = useState(false);

  const video = document.getElementById(
    "clover-iiif-video",
  ) as HTMLVideoElement;

  useEffect(() => {
    video?.addEventListener("timeupdate", () => {
      const { currentTime } = video;
      updateIsActive(start <= currentTime && currentTime < end);
    });

    return () => document.removeEventListener("timeupdate", () => {});
  }, [video]);

  const handleClick = () => {
    if (video) {
      video.pause();
      video.currentTime = start;
      video.play();
    }
  };

  return (
    <Item
      aria-checked={isActive}
      data-testid="navigator-cue"
      onClick={handleClick}
      value={label}
    >
      {label}
      <strong>{convertTime(start)}</strong>
    </Item>
  );
};

export default Cue;
