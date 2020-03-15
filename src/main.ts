import { ApolloServer } from 'apollo-server';

import resolvers from './resolvers';
import typeDefs from './typeDef';
import { environment } from './environment';

const server = new ApolloServer({ 
  resolvers, 
  typeDefs,
  introspection: environment.apollo.introspection,
  playground: environment.apollo.playground
});

server.listen(environment.port)
  .then(({ url }) => console.log(`server ready at ${url}`));

if (module.hot) {
  module.hot.accept();
  module.hot.dispose(() => server.stop());
};
