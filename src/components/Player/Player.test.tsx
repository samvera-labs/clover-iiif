import React from "react";
import { render } from "@testing-library/react";
import Player from "./Player";

describe("Player component", () => {
  it("renders", () => {
    render(
      <Player
        duration={500}
        format="video/mp4"
        height={720}
        id="https://bitdash-a.akamaihd.net/content/MI201109210084_1/m3u8s/f08e80da-bf1d-4e3d-8899-f0f6155f6efa.m3u8"
        type="Video"
        width={480}
      />,
    );
  });
});
