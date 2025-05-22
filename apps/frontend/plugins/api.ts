import { CSRF_HEADER_NAME } from "@musat/core";

export default defineNuxtPlugin(async (nuxtApp) => {
  let csrfToken: string | null = null;

  const api: ReturnType<typeof $fetch.create> = $fetch.create({
    baseURL: "/api",
    retryStatusCodes: [408, 409, 425, 429, 500, 502, 503, 504, 403],
    async onRequest({ options }) {
      if (csrfToken) {
        options.headers.set(CSRF_HEADER_NAME, csrfToken);
      }
    },
    async onResponse({ response }) {
      if (response.headers.has(CSRF_HEADER_NAME)) {
        // Update CSRF token if present in the response (e.g. login request)
        csrfToken = response.headers.get(CSRF_HEADER_NAME);
      }
    },
    async onResponseError(ctx) {
      if (ctx.response.status === 401) {
        await nuxtApp.runWithContext(() => navigateTo("/login"));
      } else if (
        ctx.response.status === 403 &&
        ctx.response._data?.code === "CSRF_ERROR"
      ) {
        await updateCsrfToken();
      }
    },
  });

  // Fetch CSRF token
  const updateCsrfToken = async () => {
    csrfToken = await api<{ csrfToken: string }>("/csrf", {
      credentials: "include",
    }).then((res) => res.csrfToken);
  };

  // Fetch CSRF token on initial load
  await updateCsrfToken();

  // Expose to useNuxtApp().$api
  return {
    provide: {
      api,
    },
  };
});
