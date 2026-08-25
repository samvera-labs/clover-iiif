// dot notation example, composing a viewer
// ---
// note that in this example, user can dictate where label (or title is)
// label in this case is a primitive
// content also becomes an advanced primitive. it essentially is the content resource of the active
// item and could be Video, Sound, Image, OR in the future, a Model when we support presentation 4.0
// Clover.Items is essentially the slider component. if an items (slider) component is used within a ROOT
// information panel is an opinionated layout of all of the support metadata and options availavble to user
// this includes about, search, table of contents (structures and ranges), annotations, and VTT files for video/audio.
import Clover from "@samvera/clover-iiif";

return (
  <Clover.Root
    as="article"
    iiifContent="https://iiif.example.org/manifest.json"
    style={{ display: "flex" }}
  >
    <div style={{ width: "61.8%" }}>
      <Clover.Label />
      <Clover.Content />
      <Clover.Items navigation="id" />
    </div>
    <Clover.InformationPanel as="aside" />
  </Clover.Root>
);

// simple use example
// ---
// user should be able to simply render a "ready to go" composed layout. this composed layout should function as it does currently
// it should be something we can construct in the backend to serve out. essentially we should be composing ready to go items the
// same way an end user might compose a custom one. our ready to go one might be rather advanced but should be able to demonstrate
// to an end-user our one could customize things.
import Viewer from "@samvera/clover-iiif/viewer";

return <Viewer iiifContent="https://iiif.example.org/manifest.json" />;
