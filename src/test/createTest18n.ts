import { createI18n } from "vue-i18n"
import { messages } from "../i18n/appMessages";

export function createTestI18n() {
  return createI18n({
    legacy: false,
    locale: "en",
    fallbackLocale: "en",
    missingWarn: false,
    fallbackWarn: false,
    messages: { en: messages.en }
  });
}
