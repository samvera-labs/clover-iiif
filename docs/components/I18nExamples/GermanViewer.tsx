import Viewer from "docs/components/DynamicImports/Viewer";
import { initCloverI18n } from "src/i18n/config";
import { useEffect } from "react";

const DEMO_MANIFEST =
  "https://api.dc.library.northwestern.edu/api/v2/works/99762c53-8a99-44d4-b7d8-2ebbc2bb274f?as=iiif";

const GermanViewer: React.FC = () => {
  useEffect(() => {
    initCloverI18n({
      lng: "de",
      fallbackLng: ["de", "en"],
      resources: {
        de: {
          clover: {
            commonClose: "Schließen",
            commonNext: "Weiter",
            informationPanelTabsAbout: "Über",
          },
        },
      },
    });
  }, []);

  return <Viewer iiifContent={DEMO_MANIFEST} />;
};

export default GermanViewer;
