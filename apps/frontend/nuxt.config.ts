const IS_PROD = process.env.NODE_ENV === "production";

// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: "2024-11-01",
  devtools: { enabled: true },
  devServer: {
    port: 3001,
  },
  // In production environment this would be managed by the reverse proxy
  // like nginx or cloudflare
  ...(!IS_PROD && {
    routeRules: {
      "/api/**": {
        proxy: "http://localhost:3000/**",
      },
    },
  }),
  modules: [
    "@nuxt/eslint",
    "@nuxt/fonts",
    "@nuxt/image",
    "@nuxt/ui",
    "@vueuse/nuxt",
  ],
  ssr: false,
  css: ["~/assets/css/main.css", "~/assets/scss/main.scss"],
  app: {
    head: {
      title: "Assistência Técnica",
      titleTemplate: "Musat | %s",
      htmlAttrs: {
        lang: "pt-BR",
      },
    },
  },
  imports: {
    dirs: ["errors"],
  },
});
