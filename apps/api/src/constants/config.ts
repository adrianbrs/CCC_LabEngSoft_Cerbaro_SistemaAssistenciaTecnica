export const Config = {
  cookies: {
    session: {
      name: 'MUSAT_SID',
    },
    userId: {
      name: 'MUSAT_UID',
    },
  },
  csrf: {
    headerName: 'x-csrf-token',
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
