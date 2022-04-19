import React, { Dispatch, SetStateAction } from "react";
interface DynamicUrlProps {
    url: string;
    setUrl: Dispatch<SetStateAction<string>>;
}
declare const DynamicUrl: React.FC<DynamicUrlProps>;
export default DynamicUrl;
