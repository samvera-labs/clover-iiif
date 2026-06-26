import dynamic from "next/dynamic";

const Map = dynamic(() => import("src/components/Map"), {
  ssr: false,
});

const CloverMap = (props) => {
  return <Map {...props} />;
};

export default CloverMap;
