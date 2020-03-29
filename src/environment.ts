const defaultPort = 4000;
const defaultDB = 'test';
const key = '@#kljniUkf09!siOUno';

interface Environment {
  apollo: {
    introspection: boolean;
    playground: boolean;
  };
  port: number | string;
  database: string;
  authKey: string;
}

export const environment: Environment = {
  apollo: {
    introspection: process.env.APOLLO_INSTROSPECTION === 'true',
    playground: process.env.APOLLO_PLAYGROUND === 'true',
  },
  port: process.env.PORT || defaultPort,
  database: process.env.DB || defaultDB,
  authKey: process.env.AUTHKEY || key,
};
