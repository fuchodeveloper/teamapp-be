import { ApolloServer } from 'apollo-server';
import mongoose  from 'mongoose';

import resolvers from './resolvers';
import typeDefs from './typeDef';
import { environment } from './environment';

const startServer = async () => {
  const server = new ApolloServer({ 
    resolvers, 
    typeDefs,
    introspection: environment.apollo.introspection,
    playground: environment.apollo.playground
  });
  
  await mongoose.connect(environment.database, {useNewUrlParser: true, useUnifiedTopology: true});

  server.listen(environment.port)
    .then(({ url }) => console.log(`server ready at ${url}`));
  
  if (module.hot) {
    module.hot.accept();
    module.hot.dispose(() => server.stop());
  };
}

startServer();