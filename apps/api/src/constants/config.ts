import { CSRF_HEADER_NAME, UID_COOKIE_NAME } from '@musat/core';

export const Config = {
  cookies: {
    session: {
      name: 'MUSAT_SID',
    },
    userId: {
      name: UID_COOKIE_NAME,
    },
  },
  csrf: {
    headerName: CSRF_HEADER_NAME,
  },
  frontend: {
    accountVerificationPath: '/account/verify',
  },
  api: {
    brasil: {
      baseURL: 'https://brasilapi.com.br',
    },
  },
} as const;
