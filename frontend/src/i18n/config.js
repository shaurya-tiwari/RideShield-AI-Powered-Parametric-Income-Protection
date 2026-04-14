import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import LanguageDetector from "i18next-browser-languagedetector";

import enCommon from "../locales/en/common.json";
import hiCommon from "../locales/hi/common.json";

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources: {
      en: { translation: enCommon },
      hi: { translation: hiCommon },
    },
    fallbackLng: "en",
    interpolation: {
      escapeValue: false, // React already does escaping
    },
  });

export default i18n;
