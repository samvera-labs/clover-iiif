"use client";

import { useEffect } from "react";
import { useRouter } from "next/router";

const Redirect = () => {
  const router = useRouter();
  const { query } = router;

  useEffect(() => {
    if (query["iiif-content"]) {
      const iiifContent = query["iiif-content"];
      router.push({
        pathname: "/docs/viewer/demo",
        query: { "iiif-content": iiifContent },
      });
    }
  }, [query]);

  return <></>;
};

export default Redirect;
