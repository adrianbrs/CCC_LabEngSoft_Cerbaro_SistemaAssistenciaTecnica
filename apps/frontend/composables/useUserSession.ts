import { UID_COOKIE_NAME, type IUserEntity } from "@musat/core";

const user = ref<IUserEntity | null>(null);

export const useUserSession = <T extends boolean>(required?: T) => {
  const router = useRouter();
  const toast = useToast();
  const userId = useCookie(UID_COOKIE_NAME);
  const { $api } = useNuxtApp();
  const isLoggedIn = computed(() => !!userId.value);

  const refresh = async () =>
    $api<IUserEntity>("/users/me").then((res) => {
      user.value = res;
      userId.value = res.id;
      return res;
    });

  const login = async (email: string, password: string) => {
    await $api<IUserEntity>("/auth/login", {
      credentials: "include",
      method: "POST",
      body: {
        email,
        password,
      },
    });

    return refresh();
  };

  const logout = async (force?: boolean) => {
    if (isLoggedIn.value || force) {
      await $api("/auth/logout", {
        credentials: "include",
        method: "DELETE",
      }).catch((err) => {
        console.error("[useUserSession] logout request failed", err);
      });
    }

    user.value = null;
    userId.value = null;
  };

  if (!user.value && required) {
    toast.add({
      title: "Entre com sua conta",
      description: "Você precisa estar logado para acessar essa página.",
      color: "warning",
      duration: 5000,
      close: true,
    });
    router.push("/login");
    throw new AuthorizationError(
      "[useUserSession] user is not authenticated but is required in this page"
    );
  }

  return {
    user: readonly(
      user as T extends true ? Ref<IUserEntity> : Ref<IUserEntity | null>
    ),
    refresh,
    login,
    logout,
    isLoggedIn,
  };
};
