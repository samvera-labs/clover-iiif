import dynamic from "next/dynamic";

const Image = dynamic(() => import("src/components/Image"), {
  ssr: false,
});

const CloverImage = (props) => {
  return <Image {...props} />;
};

export default CloverImage;
