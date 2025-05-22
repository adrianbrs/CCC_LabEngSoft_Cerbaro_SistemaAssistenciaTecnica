import { isAuthorized, type UserRole } from "@musat/core";
import { FetchError } from "ofetch";

export interface AuthOptions {
  role?: UserRole | UserRole[];
}

export default defineNuxtRouteMiddleware(async (to) => {
  const { user, refresh, logout, isLoggedIn } = useUserSession();
  const toast = useToast();

  const {
    meta: { auth },
  } = to;

  if (auth === false) {
    return;
  }

  if (isLoggedIn.value && !user.value) {
    await refresh().catch((err) => {
      if (err instanceof FetchError && err.response?.status === 401) {
        console.warn(
          `[Auth] user appears to be logged in but was not able to authenticate with the server`
        );

        toast.add({
          title: "Sessão expirada",
          description: "Por favor, faça login novamente.",
          color: "error",
        });
      } else {
        console.error(`[Auth] unknown error while loading user session`, err);

        toast.add({
          title: "Erro ao carregar sessão",
          description: "Por favor, faça login novamente.",
          color: "error",
        });
      }

      return logout().catch((err) => {
        console.error(`[Auth] logout failed`, err);
      });
    });
  }

  if (!user.value) {
    return navigateTo({
      name: "login",
      ...(to.fullPath !== "/" && {
        query: {
          redirect: to.fullPath,
        },
      }),
    });
  }

  const { role } = typeof auth === "object" ? auth : {};

  if (role && !isAuthorized(user.value, role)) {
    toast.add({
      title: "Acesso negado",
      description: "Você não tem permissão para acessar esta página.",
      color: "error",
    });

    console.warn(`[Auth] user does not have the required "${role}" role"`);

    return navigateTo("/");
  }
});

declare module "#app" {
  interface PageMeta {
    auth?: boolean | AuthOptions;
  }
}
