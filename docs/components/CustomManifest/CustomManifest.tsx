import * as Form from "@radix-ui/react-form";

import React, { useState } from "react";

import { styled } from "src/styles/stitches.config";
import { useRouter } from "next/router";

const CustomManifest = ({ placeholder }: { placeholder: string }) => {
  const [iiifContent, setIiifContent] = useState("");
  const router = useRouter();

  const handleChange = (e: any) => {
    e.preventDefault();
    e.stopPropagation();
    setIiifContent(e.target.value);
  };

  const handleSubmit = (e: any) => {
    e.preventDefault();
    e.stopPropagation();
    router.push({
      query: { "iiif-content": iiifContent },
    });
  };

  return (
    <StyledCustomManifest className="nextra-search nx-relative">
      <Form.Root onSubmit={handleSubmit}>
        <Form.Field name="iiifContent" onChange={handleChange}>
          <Form.Label>IIIF Manifest or Collection</Form.Label>
          <Form.Control
            placeholder={placeholder}
            defaultValue={router?.query?.["iiif-content"]}
            className="nx-block nx-w-full nx-appearance-none nx-rounded-lg nx-px-3 nx-py-2 nx-transition-colors nx-text-base nx-leading-tight md:nx-text-sm nx-bg-black/[.05] dark:nx-bg-gray-50/10 focus:nx-bg-white dark:focus:nx-bg-dark placeholder:nx-text-gray-500 dark:placeholder:nx-text-gray-400 contrast-more:nx-border contrast-more:nx-border-current"
          />
        </Form.Field>

        <Form.Submit />
      </Form.Root>
    </StyledCustomManifest>
  );
};

const StyledCustomManifest = styled("div", {
  margin: "2rem auto 0",
  input: {
    padding: "0.75rem 1.25rem",
  },

  label: {
    display: "none",
    opacity: "0.5",
    fontFamily: "inherit",
  },
});

export default CustomManifest;
