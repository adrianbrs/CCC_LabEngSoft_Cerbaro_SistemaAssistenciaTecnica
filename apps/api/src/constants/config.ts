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
} as const;
