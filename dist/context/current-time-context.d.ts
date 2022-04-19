import React from "react";
export declare type CurrentTimeContextShape = {
    currentTime: number;
    startTime: number;
    updateStartTime: (t: number) => void;
    updateCurrentTime: (t: number) => void;
};
export declare const CurrentTimeContext: React.Context<CurrentTimeContextShape>;
export declare const CurrentTimeProvider: ({ children, }: {
    children: React.ReactNode;
}) => JSX.Element;
