import type { IUserEntity } from "@musat/core";

const user = ref<IUserEntity | null>(null);
const isLoggedIn = ref(document.cookie.includes("MUSAT_UID"));

export const useUserSession = <T extends boolean>(required?: T) => {
  const router = useRouter();
  const toast = useToast();
  const { $api } = useNuxtApp();

  const refresh = async () =>
    $api<IUserEntity>("/users/me").then((res) => {
      user.value = res;
      isLoggedIn.value = !!res;
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

  const logout = async () => {
    if (isLoggedIn.value) {
      await $api("/auth/logout", {
        credentials: "include",
        method: "DELETE",
      });
    }

    user.value = null;
    isLoggedIn.value = false;
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
    throw new Error("User not logged in");
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
