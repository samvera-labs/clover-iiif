import dynamic from "next/dynamic";

const CloverViewer = dynamic(() => import("@samvera/clover-iiif/viewer"), {
  ssr: false,
});

export default function Home() {
  return (
    <main style={{ padding: 20, fontFamily: "sans-serif" }}>
      <h1>Clover IIIF Compatibility Check</h1>
      <p>Next builds and loads the library dynamically.</p>
      <div style={{ height: "70vh", marginTop: 16 }}>
        <CloverViewer iiifContent="https://iiif.io/api/cookbook/recipe/0001-mvm-image/manifest.json" />
      </div>
    </main>
  );
}

