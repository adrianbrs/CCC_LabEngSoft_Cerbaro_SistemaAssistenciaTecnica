export type {
  ApiFetch,
  ApiErrorResponse,
  ApiFetchOptions,
} from "~/plugins/api";

export function useApi() {
  return useNuxtApp().$api;
}
