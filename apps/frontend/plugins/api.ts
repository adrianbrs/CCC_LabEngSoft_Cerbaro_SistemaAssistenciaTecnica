import { CSRF_HEADER_NAME } from "@musat/core";
import type { FetchOptions } from "ofetch";

const BASE_PATH_TAG = Symbol("ApiBasePath");

export interface ApiErrorResponse {
  code?: string;
  message?: string | string[];
  error?: string;
}

export type ApiFetch = ReturnType<typeof $fetch.create> & {
  /**
   * Create a new API fetch instance for a specific path (inherits baseURL and options).
   */
  for(path: string, options?: ApiFetchOptions): ApiFetch;
};

export type ApiFetchOptions = FetchOptions;

const getBasePath = (...paths: string[]): string => {
  let newPath = paths
    .map((path) => path.replace(/^\/+/, ""))
    .filter(Boolean)
    .join("/");

  if (newPath.endsWith("/") && newPath.length > 1) {
    newPath = newPath.slice(0, -1);
  }
  if (!newPath.startsWith("/")) {
    newPath = `/${newPath}`;
  }

  return newPath;
};

const createApiFetch = (
  fetch: typeof $fetch,
  options?: ApiFetchOptions,
  path?: string
): ApiFetch => {
  const { baseURL, ...fetchOptions } = options ?? {};

  const basePath = getBasePath(baseURL ?? "", path ?? "");

  const apiFetch = fetch.create({
    baseURL: basePath,
    ...fetchOptions,
  }) as ApiFetch;

  Object.defineProperty(apiFetch, BASE_PATH_TAG, {
    value: path ?? "",
  });

  apiFetch.for = (
    childPath: string,
    childOptions?: ApiFetchOptions
  ): ApiFetch => {
    return createApiFetch(
      apiFetch,
      {
        baseURL: basePath,
        ...childOptions,
      },
      childPath
    );
  };

  return apiFetch;
};

export default defineNuxtPlugin(async (nuxtApp) => {
  let csrfToken: string | null = null;

  const BASE_URL = "/api";

  const api = createApiFetch($fetch, {
    baseURL: BASE_URL,
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
