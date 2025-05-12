export const Config = {
  cookies: {
    session: {
      name: 'MUSAT_SID',
    },
    userId: {
      name: 'MUSAT_UID',
    },
  },
  frontend: {
    accountVerificationPath: '/users/verify',
  },
} as const;
