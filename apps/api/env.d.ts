declare global {
  namespace NodeJS {
    interface ProcessEnv {
      [key: string]: string | undefined;

      // APP
      PORT: string;
      VERSION: string;
      NODE_ENV: 'development' | 'production' | 'test';

      // DATABASE
      DB_HOST: string;
      DB_PORT: string;
      DB_USERNAME: string;
      DB_PASSWORD: string;
      DB_NAME: string;

      // MAILGUN
      MAILGUN_DOMAIN: string;
      MAILGUN_FROM: string;
      MAILGUN_KEY: string;
    }
  }
}

export default {};
