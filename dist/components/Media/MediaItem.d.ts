import React from "react";
import { CanvasNormalized, IIIFExternalWebResource } from "@hyperion-framework/types";
export interface MediaItemProps {
    canvas: CanvasNormalized;
    active: boolean;
    thumbnail?: IIIFExternalWebResource;
    handleChange: (arg0: string) => void;
}
declare const MediaItem: React.FC<MediaItemProps>;
export default MediaItem;
