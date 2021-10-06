import React from "react";
import { Canvas } from "@hyperion-framework/types";
interface MediaProps {
    items: Canvas[];
    activeItem: number;
}
declare const Media: React.FC<MediaProps>;
export default Media;
