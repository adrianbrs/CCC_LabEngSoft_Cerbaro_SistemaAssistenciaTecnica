export default defineNuxtRouteMiddleware(async () => {
  const { user, refresh, isLoggedIn } = useUserSession();

  if (isLoggedIn.value && !user.value) {
    await refresh();
  }

  if (!user.value) {
    return navigateTo("/login");
  }
});
