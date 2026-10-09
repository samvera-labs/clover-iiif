import dynamic from "next/dynamic";

const Canvas = dynamic(() => import("src/components/Canvas"), {
  ssr: false,
});

const CloverCanvas = (props) => {
  return <Canvas {...props} />;
};

export default CloverCanvas;
