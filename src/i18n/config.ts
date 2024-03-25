import bloom from "./en/bloom.json";
import de_viewer from "./de/viewer.json";
import en_viewer from "./en/viewer.json";
import i18next from "i18next";
import { initReactI18next } from "react-i18next";

export const defaultNS = "viewer";

i18next.use(initReactI18next).init({
  lng: "en", // if you're using a language detector, do not define the lng option
  debug: true,
  resources: {
    en: {
      viewer: en_viewer,
      bloom,
    },
    de: {
      viewer: de_viewer,
    },
  },
});
