const defaultPort = 4000;
const defaultDB = 'test';

interface Environment {
  apollo: {
    introspection: boolean;
    playground: boolean;
  },
  port: number | string;
  database: string;
};

export const environment: Environment = {
  apollo: {
    introspection: process.env.APOLLO_INSTROSPECTION === 'true',
    playground: process.env.APOLLO_PLAYGROUND === 'true'
  },
  port: process.env.PORT || defaultPort,
  database: process.env.DB || defaultDB
};
