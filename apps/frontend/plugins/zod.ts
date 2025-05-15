import i18next from "i18next";
import ptBR from "zod-i18n-map/locales/pt/zod.json";
import { z } from "zod";
import { zodI18nMap } from "zod-i18n-map";

export default defineNuxtPlugin(() => {
  i18next.init({
    lng: "pt",
    resources: {
      pt: {
        zod: ptBR,
      },
    },
  });
  z.setErrorMap(zodI18nMap);

  return {
    provide: {
      z,
    },
  };
});
