import "@testing-library/jest-dom";
import { vi } from "vitest";

vi.mock("react-i18next", () => ({
  useTranslation: () => ({
    t: (key) => key,
    i18n: {
      changeLanguage: () => new Promise(() => {}),
      language: "en"
    }
  }),
  initReactI18next: {
    type: "3rdParty",
    init: () => {}
  }
}));
