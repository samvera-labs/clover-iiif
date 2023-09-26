import React, {useState} from 'react'
import * as Form from "@radix-ui/react-form";

import Viewer from "../../docs/components/DynamicImports/Viewer"
import { styled } from "../../src/styles/stitches.config";


function Demo() {
  const defaultIiifContent =
    "https://seagate.whirl-i-gig.com/admin/service/IIIF/manifest/ca_objects:170";

  const [iiifContent, setIiifContent] = useState(defaultIiifContent)
  const [tempIiifContent, setTempIiifContent] = useState(defaultIiifContent)

  const handleChange = (e) => {
    e.preventDefault();
    setTempIiifContent(e.target.value);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setIiifContent(tempIiifContent)
  };

  const options = {
    showIIIFBadge: false,
    informationPanel: {
      renderAbout: true,
      renderSupplementing: true,
      renderClips: true
    }
  }

  return (
    <StyledDiv>
      <Form.Root onSubmit={handleSubmit}>
        <Form.Field name="iiifContent" onChange={handleChange}>
          <Form.Label>IIIF Manifest</Form.Label>
          <Form.Control
            defaultValue={ iiifContent}
            placeholder="IIIF Manifest"
            className="nx-block nx-w-full nx-appearance-none nx-rounded-lg nx-px-3 nx-py-2 nx-transition-colors nx-text-base nx-leading-tight md:nx-text-sm nx-bg-black/[.05] dark:nx-bg-gray-50/10 focus:nx-bg-white dark:focus:nx-bg-dark placeholder:nx-text-gray-500 dark:placeholder:nx-text-gray-400 contrast-more:nx-border contrast-more:nx-border-current"
          />
        </Form.Field>

        <Form.Submit >Submit</Form.Submit >
      </Form.Root>
      <Viewer iiifContent={iiifContent} options={options}/>
    </StyledDiv>
  );
}


const StyledDiv = styled("div", {
  margin: "1rem auto",
  input: {
    padding: "0.5rem",
    width: '90%',
    marginBottom: '0.5rem'
  },

  button: {
    padding: "0.25rem",
  },

  label: {
    display: "none",
  },
});

export default Demo
