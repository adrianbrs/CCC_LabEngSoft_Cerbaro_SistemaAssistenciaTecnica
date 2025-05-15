export default defineNuxtRouteMiddleware(async () => {
  const { isLoggedIn } = useUserSession();

  console.log("isLoggedIn", isLoggedIn.value);

  if (isLoggedIn.value) {
    return navigateTo("/");
  }
});
