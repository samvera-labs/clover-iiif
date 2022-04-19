import React from "react";
import { ConfigOptions } from "context/viewer-context";
interface Props {
    manifestId: string;
    canvasIdCallback?: (arg0: string) => void;
    customTheme?: any;
    options?: ConfigOptions;
}
declare const App: React.FC<Props>;
export default App;
