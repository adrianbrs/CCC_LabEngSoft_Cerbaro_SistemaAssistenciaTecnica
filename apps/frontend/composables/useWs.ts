export function useWs() {
  return useNuxtApp().$socket;
}
